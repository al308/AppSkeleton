default: check

setup:
    npm ci
    npx expo-doctor
    @echo "✓ ready — run 'just start' to boot the app"

install:
    npm install

check: lint types test

doctor:
    npx expo-doctor

lint:
    npm run lint:fix
    npm run format

lint-ci:
    npm run lint
    npm run format:check

types:
    npm run typecheck

test:
    npm test

start:
    npm run start

ios:
    npm run ios

android:
    npm run android

web:
    npm run web

ci: lint-ci types test

clean:
    rm -rf node_modules .expo dist web-build coverage
