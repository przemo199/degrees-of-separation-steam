# [Degrees of Separation Between Steam Users](https://degrees-of-separation-steam.herokuapp.com/)  

A website built using Svelte with Node.js backend that allows you to check the degree of separation between two Steam users.

## Usage

To perform a search you need to provide a Steam api key (you can get it [here](https://steamcommunity.com/dev/apikey) and deactivate right afterwards) and SteamIds of two Steam profiles that you want to check.  

The search is performed on the server side and returns degree of separation, connection path from one profile to another, number of reqests done, number of SteamIds received, number of private profiles found and total time of search in milliseconds.

>**_NOTE:_** The search depends on the Steam profiles being public which might cause the search to not return any result or return inefficient connection path
