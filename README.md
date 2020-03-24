# Covid-19 Discord Bot

A simple discord bot that can query data about confirmed, death and recovered cases regarding covid-19, make plots with that data and use regression to make short term predictions. 

## Table of Contents

- [What happened](#WhatHappened)
- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)

## WhatHappened

This bot unfortunately one day stop working. To this day I am unsure as to why that is although I do believe that it has something to do with the CSV parsing part of the code (it appears as if
[this](https://github.com/AntoniosBarotsis/coronaBot/blob/3a46332fef27258d70c9a0b97c610dc25a87733d/commands/cv.js#L64-L68) part of the code never executes). Further development of the bot is 
obviously halted until further notice and as a result various of its components remain unfinished (the command line part for example). Although I will probably never get to finish this project
it has most certainly been my most interesting one so far and I discovered how much I love data science because of it. That said, I'm still willing to make this public since I believe that there
are a couple of good ideas here and there that people might find useful. Hope you enjoy this as much as I did :). I'll keep an eye out in case anyone manages to fix this though that would be neat!
Rest of readme is a bit outdated but oh well, I feel like keeping it that way.

## Installation

You have to make a [Plot.ly](https://chart-studio.plot.ly/feed/#/) account and copy your Api key.
Download the repository and add a .env file in root containing your bot token, your preferred prefix and your Plotly username and api key.
If you dont want to use a discord bot you can also run the code through your console by running ``npm run cv_cmd`` in the root directory.

## Usage

``[modifier] [country] [pred]``

- modifier
   - c (confirmed cases)
   - r (recovered)
   - d (deaths). \
   Inputting a modifier is optional and in the case of it's absence, confirmed cases are selected by default.
   
- country \
    All countries with recorded cases are supported. You have the option of typing ``all`` which
    will return you data for all countries combined as well as ``other`` which does the same thing
    minus China.
    
- pred \
    Typing ``pred`` at the end of your query will make the program use regression to effectively
    approximate the number of cases in the near future for the country you inputted.
    
## Support
   
Please [open an issue](https://github.com/AntoniosBarotsis/coronaBot/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). 
Create a branch, add commits, and [open a pull request](https://github.com/AntoniosBarotsis/coronaBot/compare).
