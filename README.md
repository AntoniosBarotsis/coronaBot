# Covid-19 Discord Bot

A simple discord bot that can query data about confirmed, death and recovered cases regarding covid-19, make plots with that data and use regression to make short term predictions. 

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)

## Installation

Download the repository and add your bot token and your preferred prefix in the .env file present in root.
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
