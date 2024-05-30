# ArtBot

A front-end GUI for interacting with AI Horde's distributed cluster of Stable Diffusion workers.

## Table of Contents

- [Intro](#intro)
- [Setup](#setup)
  - [Requirements](#requirements)
  - [Installing](#installing)

## Intro

ArtBot is a front-end web client designed for interacting with the [AI Horde](https://aihorde.net/) open source distributed cluster -- a group of GPUs running Stable Diffusion whose processing time has been kindly donated by an enthusiastic community of volunteers.

ArtBot is built using [Next.js 14](https://nextjs.org/) and [Typescript](https://www.typescriptlang.org/). It uses client-side technologies such as IndexedDB and LocalStorage APIs in order to securely and privately store the AI generated images you've created using the cluster within your own web browser.

## Setup

### Requirements

- node `>= 18.18.0`
- npm `>= 9.5.1`

Most of these steps should be applicable to Linux, MacOS, or Windows environments.

Installing various versions of Node.js on your machine can be tricky. I am a big fan of [nvm](https://github.com/nvm-sh/nvm), which allows you to run multiple isolated versions of Node.js on your machine with ease.

Using `nvm`, you can install Node like this:

```bash
> nvm install v18.18.0
> nvm alias default node
> node -v # Checks which version of Node is currently running
```

### Installing

Once you have your Node.js environment setup, you can clone this repository and install the required packages. Depending on the specs of your machine and speed of your internet connection, installing all packages may take a minute or two.

```bash
> git clone https://github.com/Haidra-Org/artbot.git
> cd artbot
> npm install
```

## Contributions

Contributions are very welcome! General guidelines are as follows:

1. [Fork this repository](https://github.com/Haidra-Org/artbot/fork)
2. Cut a new feature branch. e.g., `> git checkout -b feat/my-cool-new-feature`
3. Make any necessary changes and commit your code! (If possible, use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/))
4. [Open a new pull request](https://github.com/Haidra-Org/artbot/pulls) based on your feature branch.

Let me know if you have any questions. I'm more than happy to help.

## Acknowledgements

ArtBot makes use of a number of resources provided by designers and developers who make their work freely available. Without these tools, ArtBot and many other projects on the Internet would not be able to exist. We are very grateful!

- ArtBot logo: ["AI free icon" via Flaticon](https://www.flaticon.com/free-icon/ai_2814666?related_id=2814650)
- [Next.js](https://nextjs.org/)
- [Tabler Icons](https://tabler-icons.io/)
- [Tailwind CSS](https://tailwindcss.com/)
