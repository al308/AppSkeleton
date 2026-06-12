#!/usr/bin/env ruby
# frozen_string_literal: true

# Read-only Google Play status check — the Android pendant to asc-status.rb.
# Answers "does the app exist on Play, and what's live on each track?" against
# Google's source of truth, independent of fastlane supply's noisy output.
#
# Why this exists: supply logs can be misleading; a "Package not found" buried in
# scrollback is easy to miss. This verifies app existence + track release state
# (and the live versionCodes) directly via the Android Publisher API. Uses only
# Ruby stdlib (OpenSSL/Net::HTTP) — no gems, no fastlane needed.
#
# Auth: a Google Play service-account JSON key (the same one `eas submit -p
# android` and fastlane supply use). The service account must have access to the
# app in Play Console → Setup → API access.
#
# Usage:
#   SUPPLY_JSON_KEY=./play-service-account.json \
#     PLAY_PACKAGE=com.example.app ruby fastlane/scripts/play-status.rb

require "openssl"
require "base64"
require "json"
require "net/http"

KEY_FILE = ENV["SUPPLY_JSON_KEY"] || "./play-service-account.json"
PACKAGE = ENV["PLAY_PACKAGE"] || ENV["ANDROID_PACKAGE"] ||
          abort("Set PLAY_PACKAGE to the app's android.package (e.g. com.example.app).")

abort("Service-account key not found: #{KEY_FILE}") unless File.exist?(KEY_FILE)
KEY = JSON.parse(File.read(KEY_FILE))

def b64(data) = Base64.urlsafe_encode64(data).delete("=")

# Exchange the service-account key for an OAuth2 access token (signed JWT grant).
def access_token
  now = Time.now.to_i
  header = b64({ alg: "RS256", typ: "JWT" }.to_json)
  claim = b64({
    iss: KEY["client_email"],
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: KEY["token_uri"],
    iat: now,
    exp: now + 3600
  }.to_json)
  signing_input = "#{header}.#{claim}"
  pkey = OpenSSL::PKey::RSA.new(KEY["private_key"])
  sig = b64(pkey.sign(OpenSSL::Digest.new("SHA256"), signing_input))
  assertion = "#{signing_input}.#{sig}"

  uri = URI(KEY["token_uri"])
  res = Net::HTTP.post_form(uri, {
    "grant_type" => "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "assertion" => assertion
  })
  body = JSON.parse(res.body)
  body["access_token"] || abort("OAuth failed: #{body}")
end

TOKEN = access_token
BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/#{PACKAGE}"

# Parse a response body as JSON, but degrade gracefully: the Play API returns an
# HTML error page for some failures (e.g. a 404), which must not crash the parse.
def parse_body(res)
  body = res.body.to_s
  return {} if body.empty?

  JSON.parse(body)
rescue JSON::ParserError
  { "raw" => body[0, 200] }
end

def request(token, klass, path, body = nil)
  uri = URI("#{BASE}#{path}")
  req = klass.new(uri)
  req["Authorization"] = "Bearer #{token}"
  if body
    req["Content-Type"] = "application/json"
    req.body = body.to_json
  end
  res = Net::HTTP.start(uri.host, 443, use_ssl: true) { |h| h.request(req) }
  [res.code.to_i, parse_body(res)]
end

def get(token, path) = request(token, Net::HTTP::Get, path)
def post(token, path, body) = request(token, Net::HTTP::Post, path, body)
def delete(token, path) = request(token, Net::HTTP::Delete, path)

# Reading track state requires an "edit" transaction. We create one, read, and
# delete it without committing (purely read-only).
code, edit = post(TOKEN, "/edits", {})
if code == 404
  puts "NO APP found on Play for package #{PACKAGE}"
  puts "(supply cannot create the app — create it in the Play Console and seed it"
  puts " with a first manual/internal upload before the first supply run.)"
  exit 1
elsif code != 200 && code != 201
  abort("Play API error (#{code}): #{edit}")
end
edit_id = edit["id"]

begin
  puts "APP exists on Play: #{PACKAGE}  (edit #{edit_id})"
  _, tracks = get(TOKEN, "/edits/#{edit_id}/tracks")
  list = tracks["tracks"] || []
  if list.empty?
    puts "  No tracks have a release yet (app created but nothing uploaded)."
  end
  list.each do |t|
    releases = t["releases"] || []
    if releases.empty?
      puts "  track #{t['track']}: (no releases)"
    end
    releases.each do |r|
      vcs = (r["versionCodes"] || []).join(", ")
      puts "  track #{t['track']}: #{r['status']}  name=#{r['name']}  versionCodes=[#{vcs}]"
    end
  end
ensure
  delete(TOKEN, "/edits/#{edit_id}") # never commit — keep this read-only
end
