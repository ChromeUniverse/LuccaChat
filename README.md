# LuccaChat

A full-stack live chat web application, built by yours truly. [Check it out here!](http://luccachat.blaring.net/)

![LuccaChat](https://pbs.twimg.com/media/FjgSBM1XEAMXPWm?format=jpg&name=large)

Built with:
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) 
- [Node](https://nodejs.org/)
- [Express](https://expressjs.com/) (REST API)
- [ws](https://github.com/websockets/ws) (WebSockets server)
- [Passport](https://passportjs.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Zod](https://zod.dev/)

## Features

- **OAuth2**: Login with either your Google or GitHub account (no merging yet!)
- **Account settings**: update your account info at any time: name, handle, profile picture, or your accent color.
- **Dark Mode by default**: Heck yeah!!! You can switch between light and dark themes whenever you'd like.
- **Customizable accent color**: spice up your LuccaChat client and add some personality to your messages by changing your accent color.
- **Friend requests**: Send friend requests to add your friends and chat with them.
- **DMs**: Once you've added a friend, you can chat privately with them in your DMs
- **Group chats**: Create group chats and invite your friends to chat. Both private and public groups are supported!
- **Group settings**: update your group's info at any time: name, description, profile picture or group visibility.
- **Invite links**: share invite links to your group chats, private or public, with your friends and let them join in on the discussion. You can regenerated invites from the group settings page whenever you'd like.
- **Public group browser**: browse public group chats and join them to hang out with friendly internet strangers.
- **Instant PFP updates**: whenever you update PFPs for your account or your group chats, all your online contacts will be notified and will be able to instantly see your glorious new PFP. *Top that, Discord!*
- **Info panels**: Allow you to view more info about users (name, handle, groups in common) and group chats (name, description, creation date, creator, full member list, and more).
- **Delete messages and groups**: Don't worry, we won't tell anyone.
- **Leave groups**: seems obvious, but hey, if it's there it's technically a feature right?


## FAQ




## Self-hosting

So you want to self-host your own LuccaChat instance? Well, I appreciate the interest! Unfortunately, LuccaChat's current [public deployment](http://luccachat.blaring.net/) is a hodgepodge mix of hacky NGINX configs and just a complete mess in general. 

Currently, both the frontend and backend and hosted on a single Ubuntu server on [AWS Lightsail](https://aws.amazon.com/lightsail/), with [NGINX](https://www.nginx.com/) doing double duty as a static file server for the client and as a reverses proxy for the Express REST API and the ws WebSockets server. Both servers are managed by [PM2](https://pm2.keymetrics.io/).

LuccaChat has **lots** of quirks when it comes to deploying and hosting the app. Expect this section to get updated soon as these issues get fixed. A more streamlined deployment process is currently in the works.

### Prerequisites

- A recent version of Ubuntu Linux on a virtual private server
- Configure OpenSSH (if you haven't already) and log into your server
- [Install](https://github.com/nodesource/distributions/blob/master/README.md#deb) the most recent version of Node and npm
- Clone this repo and `cd` into it

### Backend

Start with the server:
```
cd server
```

Install dependencies:
```
npm install
sudo npm install -g pm2
```

Build the server's source files with the TypeScript:
```
tsc
```

Initialize both servers with PM2:
```
npm run prod-start-http
npm run prod-start-ws
```

### Frontend

`cd` into the client's source folder:
```
cd ../client
```

Install dependencies:
```
npm install
```

Build the client:
```
npm run build
```

### Deployment

This section will cover some additional configuration that's required to make your LuccaChat instance publicly accessible from the internet.

#### Configure NGINX

_TODO_

#### SSL/HTTPS config with `certbot`

_TODO_

<!-- First, make sure your VPS provider's firewall is open on ports 80 and 443. Don't forget to configure your DNS settings -->