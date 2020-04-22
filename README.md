# Covid-19 Discord Bot

[![Build Status](https://travis-ci.org/AntoniosBarotsis/coronaBot.svg?branch=master)](https://travis-ci.org/AntoniosBarotsis/coronaBot)
![GitHub repo size](https://img.shields.io/github/repo-size/AntoniosBarotsis/coronaBot?color=light%20green)

A simple discord bot/command line application that can query data about confirmed, death and recovered cases regarding Covid-19 and make 
plots with that data. 

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)

## Installation

- Using a Discord bot:
    Download the repository and add a ``.env`` file in root containing your bot token and your preferred prefix (I used ``.``
    as a prefix in the following examples).
- Without a Discord bot:
    Run the code through your console by running ``npm run cv [arguments]`` in the root directory.

## Usage

``.cv [modifier] [country] [option]``

- modifier
   - c (confirmed cases)
   - r (recovered)
   - d (deaths). \
   Inputting a modifier is optional and in the case of it's absence, confirmed cases are selected by default.
   
- country \
    All countries with recorded cases are supported. You have the option of typing ``all`` which
    will return you data for all countries combined as well as ``other`` which does the same thing
    minus China.
    
- option (optional)
    - pie\
        Prints a pie chart (no need for modifier). Example usage: ``.cv us pie``
    - change\
        Returns a chart showing the rate of change (modifier applicable). Example usage: ``.cv d italy change``
    - compare ``[country 2]``\
        Plots both countries on the same chart (modifier applicable). Example usage: ``.cv r greece compare romania``.
        Note that you can combine ``change`` and ``compare`` like so: ``.cv spain compare italy change``.
    - log\
        Plots a logarithmic graph instead of a linear one. Can be combined with ``compare``.
        
You can always use ``.help`` and ``.help [command]`` for a list of commands + usage.
    
## Support
   
Please [open an issue](https://github.com/AntoniosBarotsis/coronaBot/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). 
Create a branch, add commits, and [open a pull request](https://github.com/AntoniosBarotsis/coronaBot/compare).

## Showcase
 - ```.cv all```\
![bruh](/images/3.jpeg)

 - ```.cv other change```\
![bruh](/images/4.jpeg)

 - ```.cv us pie```\
![bruh](/images/2.jpeg)

 - ```.cv d greece compare romania```\
![bruh](/images/1.jpeg)

- ```.cv spain compare italy change```\
![bruh](/images/5.jpeg)

- ```.cv russia compare albania log```\
![bruh](/images/6.jpeg)