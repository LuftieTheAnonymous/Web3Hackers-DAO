FROM ghcr.io/foundry-rs/foundry:latest

WORKDIR /contracts
COPY . .

USER root

RUN forge build --via-ir --force

ENV FOUNDRY_DISABLE_NIGHTLY_WARNING=1


CMD ["anvil"]