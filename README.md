# rc-qna-bot

RingCentral Q & A chatbot for RingCentral developers.


## For contributors

### Setup

```
yarn install
```

### local run

```
cp .env.sample .env
edit .env
yarn test
```

### Deploy

```
cd messages
cp env.sample.yml env.yml
edit env.yml
```

#### Full deploy

    yarn deploy:full

#### Quick deploy

    yarn deploy


### Service information

    yarn run info


### Log information

    yarn run log

Or check log in realtime:

    yarn run log:stream
