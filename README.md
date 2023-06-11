# [Degrees of Separation Between Steam Users](https://degrees-of-separation-steam.herokuapp.com/)  

[DockerHub repository](https://hub.docker.com/repository/docker/przemo199/degrees-of-separation-steam)

Degrees of Separation Between Steam Users is a website built using Svelte with Node.js backend using Express that allows the user to check the degree of separation between two Steam users.

## Installation

Copy the following repository using:

```bash 
git clone https://github.com/przemo199/degrees-of-separation-steam.git
```

Run the following command to install dependencies:

```bash
yarn install
```

Build the project using:

```bash
yarn build
```

## Usage

Launch the application using:

```bash
yarn start
```

and open https://localhost:3000/


To perform a search you need to provide a Steam API key (it can be obtained [here](https://steamcommunity.com/dev/apikey) and deactivated right afterwards) and SteamIDs of two Steam profiles.  

The search is performed on the server side and returns degree of separation, connection path from one profile to another, number of performed requests, number of SteamIds received, number of private profiles found and total time of search in milliseconds.

>**_NOTE:_** The search depends on the Steam profiles being public which might cause the search to not return any result or return inefficient connection path
