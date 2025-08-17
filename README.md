# No content

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/joseangelsanchezs-projects/v0-no-content)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/Gz95kStQzKg)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/joseangelsanchezs-projects/v0-no-content](https://vercel.com/joseangelsanchezs-projects/v0-no-content)**

### Vercel frozen lockfile error

If a build fails with:

> ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date

You have two options:

1) Update and commit the lockfile (preferred):

	pnpm install
	git add pnpm-lock.yaml
	git commit -m "chore: update lockfile"

2) Allow installs without a frozen lockfile in CI (configured here via vercel.json):

	installCommand: pnpm install --no-frozen-lockfile

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/Gz95kStQzKg](https://v0.app/chat/projects/Gz95kStQzKg)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
