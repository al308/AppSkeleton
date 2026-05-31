#!/usr/bin/env ruby
# frozen_string_literal: true

# Read-only App Store Connect status check — independent of fastlane's noisy
# output. Verifies what's ACTUALLY live (app existence, version state, metadata
# field lengths, screenshot counts) using the App Store Connect API directly.
#
# Why this exists: fastlane/deliver logs can be misleading; this answers
# "did it actually upload?" against Apple's source of truth. Uses only Ruby
# stdlib (OpenSSL/Net::HTTP) — no gems, no fastlane needed.
#
# Usage:
#   ASC_KEY_ID=... ASC_ISSUER_ID=... ASC_KEY_PATH=AuthKey_XXX.p8 \
#     APP_BUNDLE_ID=com.example.app ruby fastlane/scripts/asc-status.rb

require "openssl"
require "base64"
require "json"
require "net/http"

KEY_ID = ENV.fetch("ASC_KEY_ID")
ISSUER = ENV.fetch("ASC_ISSUER_ID")
P8 = File.read(ENV.fetch("ASC_KEY_PATH"))
BUNDLE = ENV["APP_BUNDLE_ID"] || ENV["ASC_BUNDLE_ID"] ||
         abort("Set APP_BUNDLE_ID (or ASC_BUNDLE_ID) to the registered bundle id.")

def b64(data) = Base64.urlsafe_encode64(data).delete("=")

def jwt
  ec = OpenSSL::PKey::EC.new(P8)
  header = b64({ alg: "ES256", kid: KEY_ID, typ: "JWT" }.to_json)
  now = Time.now.to_i
  payload = b64({ iss: ISSUER, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }.to_json)
  signing_input = "#{header}.#{payload}"
  der = ec.sign(OpenSSL::Digest.new("SHA256"), signing_input)
  asn1 = OpenSSL::ASN1.decode(der)
  r = asn1.value[0].value.to_s(2).rjust(32, "\x00")
  s = asn1.value[1].value.to_s(2).rjust(32, "\x00")
  "#{signing_input}.#{b64(r + s)}"
end

TOKEN = jwt

def get(path)
  uri = URI("https://api.appstoreconnect.apple.com#{path}")
  req = Net::HTTP::Get.new(uri)
  req["Authorization"] = "Bearer #{TOKEN}"
  res = Net::HTTP.start(uri.host, 443, use_ssl: true) { |h| h.request(req) }
  JSON.parse(res.body)
rescue StandardError => e
  { "error" => e.message }
end

apps = get("/v1/apps?filter%5BbundleId%5D=#{BUNDLE}&limit=1")["data"] || []
if apps.empty?
  puts "NO APP found for bundle id #{BUNDLE}"
  puts "(The ASC API cannot create apps — create it once in the App Store Connect UI.)"
  exit 1
end

app = apps.first
puts "APP: #{app.dig('attributes', 'name')}  id=#{app['id']}  sku=#{app.dig('attributes', 'sku')}"

versions = get("/v1/apps/#{app['id']}/appStoreVersions")["data"] || []
versions.each do |v|
  puts "VERSION #{v.dig('attributes', 'versionString')} — #{v.dig('attributes', 'appStoreState')}"
  locs = get("/v1/appStoreVersions/#{v['id']}/appStoreVersionLocalizations")["data"] || []
  locs.each do |l|
    a = l["attributes"]
    puts "  #{a['locale']}: desc=#{(a['description'] || '').length}ch keywords=#{(a['keywords'] || '').length}ch " \
         "promo=#{(a['promotionalText'] || '').length}ch whatsNew=#{(a['whatsNew'] || '').length}ch"
    sets = get("/v1/appStoreVersionLocalizations/#{l['id']}/appScreenshotSets")["data"] || []
    total = sets.sum { |set| (get("/v1/appScreenshotSets/#{set['id']}/appScreenshots")["data"] || []).length }
    puts "    screenshots: #{total} across #{sets.length} set(s)"
  end
end
