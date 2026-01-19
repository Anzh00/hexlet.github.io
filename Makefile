install:
	npm ci

start:
	npm run start

build:
	npm run build

update-deps:
	npx ncu -u
	npm i

# clean:
# 	bundle exec jekyll clean
#
# clean-build: clean build
