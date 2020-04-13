const util = require('./file.util');
const utility = require('./../data/utility');

let obj = [
    [
        {
            date: '1/22/20',
            value: 0,
        },
    ],
];

let obj2 = [
    [
        {
            date: '1/22/20',
            value: 0,
        },
        {
            date: '1/23/20',
            value: 1,
        },
    ],
];

let obj3 = [
    [
        {
            date: '1/22/20',
            value: 1,
        },
        {
            date: '1/23/20',
            value: 0,
        },
    ],
];

let obj4 = [
    [
        {
            date: '1/22/20',
            value: 1,
        },
        {
            date: '1/23/20',
            value: 2,
        },
        {
            date: '1/24/20',
            value: 2,
        },
        {
            date: '1/25/20',
            value: 3,
        },
    ],
];

it('Command is found', async() => {
    await util.getCommand('cv').then(e => {
        expect(0).toBe(0);
    });
});

it('getChange', async() => {
    expect(utility.getChange([0, 2, 3, 1, 9]))
        .toStrictEqual([0, 2, 1, -2, 8]);
});

describe('replaceKnownCountry', () => {

    it('Korea', async() => {
        expect(utility.replaceKnownCountry(['south korea'])).toStrictEqual(['korea']);
    });

    it('Random country', async() => {
        expect(utility.replaceKnownCountry(['greece'])).toStrictEqual(['greece']);
    });

    it('Vatican', async() => {
        expect(utility.replaceKnownCountry(['vatican'])).toStrictEqual(['holy see']);
    });

    it('UK', async() => {
        expect(utility.replaceKnownCountry(['uk'])).toStrictEqual(['united kingdom']);
    });
});

describe('getGraphLabel', () => {
    it('No flag', async() => {
        expect(utility.getGraphLabel('greece', '')).toBe('Confirmed cases in Greece');
    });

    it('No country', async() => {
        expect(utility.getGraphLabel('', 'c')).toBe('Confirmed cases in ');
    });

    it('No flag or country', async() => {
        expect(utility.getGraphLabel('', '')).toBe('Confirmed cases in ');
    });

    it('Recovered', async() => {
        expect(utility.getGraphLabel('greece', 'r')).toBe('Recovered cases in Greece');
    });

    it('Deaths', async() => {
        expect(utility.getGraphLabel('greece', 'd')).toBe('Deaths in Greece');
    });
});

describe('getGraphColor', () => {
    it('Confirmed', async() => {
        expect(utility.getGraphColor('c')).toBe('rgba(41, 121, 255, 1)');
    });

    it('Empty', async() => {
        expect(utility.getGraphColor('')).toBe('rgba(41, 121, 255, 1)');
    });

    it('Recovered', async() => {
        expect(utility.getGraphColor('r')).toBe('rgba(0, 200, 83, 1)');
    });

    it('Deaths', async() => {
        expect(utility.getGraphColor('d')).toBe('rgba(235, 40, 40, 1)');
    });
});

describe('formatForGraph', () => {
    it('One date', () => {
        expect(utility.formatForGraph(obj)).toStrictEqual([[{date: '20-1-22', value: 0}]]);
    });

    it('Empty', () => {
        expect(utility.formatForGraph([[]])).toStrictEqual([[]]);
    });

    it('2 Dates', () => {
        expect(utility.formatForGraph(obj2)).toStrictEqual([[{date: '20-1-22', value: 0}, {date: '20-1-23', value: 1}]]);
    });
});

describe('filterCasesDecreasing', () => {
    it('No decrease', async() => {
        expect(utility.formatForGraph(utility.filterCasesDecreasing(obj2)))
            .toStrictEqual([[{date: '20-1-22', value: 0}, {date: '20-1-23', value: 1}]]);
    });

    it('Swap', async() => {
        expect(utility.formatForGraph(utility.filterCasesDecreasing(obj3)))
            .toStrictEqual([[{date: '20-1-22', value: 1}]]);
    });

    it('Empty', async() => {
        expect(utility.filterCasesDecreasing([[]]))
            .toStrictEqual([[]]);
    });
});

describe('filterCasesDupes', () => {
    it('One duplicate', async() => {
        expect(utility.formatForGraph(utility.filterCasesDupes(obj4)))
            .toStrictEqual([[{date: '20-1-22', value: 1}, {date: '20-1-23', value: 2}, {date: '20-1-25', value: 3}]]);
    });

    it('No duplicates', async() => {
        expect(utility.filterCasesDupes(obj3))
            .toStrictEqual(obj3);
    });

    it('Empty', async() => {
        expect(utility.filterCasesDupes([[]]))
            .toStrictEqual([[]]);
    });
});

describe('filterCasesEmpty', () => {
    it('Empty', async() => {
        expect(utility.filterCasesEmpty([[]])).toStrictEqual([[]]);
    });

    it('No empty', async() => {
        expect(utility.formatForGraph(utility.filterCasesEmpty(obj4)))
            .toStrictEqual([[{date: '20-1-22', value: 1}, {date: '20-1-23', value: 2}, {date: '20-1-24', value: 2}, {date: '20-1-25', value: 3}]]);
    });

    it('One empty', async() => {
        expect(utility.formatForGraph(utility.filterCasesEmpty(obj2)))
            .toStrictEqual([[{date: '20-1-23', value: 1}]]);
    });
});

describe('includesCountry', () => {
    it('1st index should trigger', async() => {
        expect(utility.includesCountry([['greece', null]], 0, 'greece')).not.toBeNull();
    });

    it('2nd index should trigger', async() => {
        expect(utility.includesCountry([[null, 'greece']], 0, 'greece')).not.toBeNull();
    });

    it('Should not trigger', async() => {
        expect(utility.includesCountry([['greece', null]], 0, 'italy')).toBeNull();
    });
});

describe('sumRows', () => {
    it('test sum 1', async() => {
        expect(utility.sumRows([{value: 0}, {value: 5}], [{value: 5}, {value: 0}])).toStrictEqual([{value: 5}, {value: 5}]);
    });

    it('test sum 2', async() => {
        expect(utility.sumRows([{value: 0}, {value: 0}], [{value: 0}, {value: 0}])).toStrictEqual([{value: 0}, {value: 0}]);
    });
});

describe('getRowData', () => {
    let arr = [
        ['Country', 'Country 2', 'coord', 'inates', 'date 1', 'date 2'],
        ['Greece', 'yes', 'coord', 'inates', '5', '15'],
        ['not Greece', 'no', 'coord', 'inates', '15', '5'],
    ];

    let res1 = [
        {value: 5, date: 'date 1'}, {value: 15, date: 'date 2'},
    ];

    let res2 = [
        {value: 15, date: 'date 1'}, {value: 5, date: 'date 2'},
    ];

    it('test 1', async() => {
        expect(utility.getRowData(arr, 1)).toStrictEqual(res1);
    });

    it('test 2', async() => {
        expect(utility.getRowData(arr, 2)).toStrictEqual(res2);
    });
});

describe('shouldSum', () => {
    it('all', async() => {
        expect(utility.shouldSum('all', null, null)).not.toBeNull();
    });

    it('other (no china)', async() => {
        expect(utility.shouldSum('other', [['greece', null]], 0)).not.toBeNull();
    });

    it('other (with china)', async() => {
        expect(utility.shouldSum('other', [['china', null]], 0)).toBe(false);
    });

    it('random country (exists)', async() => {
        expect(utility.shouldSum('greece', [['greece', null]], 0)).not.toBeNull();
    });

    it('random country (doenst exists=)', async() => {
        expect(utility.shouldSum('greece', [['kekw', null]], 0)).toBeNull();
    });
});

describe('getPopulation', () => {
    const population = require('../data/population');

    it('us', async() => {
        expect(utility.getPopulation('us', null)).toBe(329470573);
    });

    it('all', async() => {
        expect(utility.getPopulation('all', null)).toBe(7444509223);
    });

    it('other', async() => {
        expect(utility.getPopulation('other', null)).toBe(6034991826);
    });

    it('Greece', async() => {
        expect(utility.getPopulation('greece', population)).toBe(11159773);
    });
});

describe('populationData', () => {
    let population = 10;
    let populationC = {value: 7};
    let populationD = {value: 2};
    let populationR = {value: 3};

    let obj = {
        populationC: populationC.value,
        confirmedOverPop: (70.00).toFixed(2),
        recoveredOverConfirmed: (300 / 7).toFixed(2),
        deadOverConfirmed: (200 / 7).toFixed(2),
        activeOverConfirmed: (200 / 7).toFixed(2),
        activeCases: populationC.value - populationD.value - populationR.value,
    };

    it('No populationC', async() => {
        expect(utility.populationData(null, populationD, populationR, population).populationC).toStrictEqual(0);
    });

    it('All params passed', async() => {
        expect(utility.populationData(populationC, populationD, populationR, population)).toStrictEqual(obj);
    });
});

describe('getGraphPieCountry', () => {
    it('all', async() => {
        expect(utility.getGraphPieCountry('all')).toStrictEqual('all countries');
    });

    it('other', async() => {
        expect(utility.getGraphPieCountry('other')).toStrictEqual('all countries except China');
    });

    it('Greece', async() => {
        expect(utility.getGraphPieCountry('greece')).toStrictEqual('Greece');
    });
});

describe('replaceKnownCountryPie', () => {
    it('unknown country', async() => {
        expect(utility.replaceKnownCountryPie('greece')).toStrictEqual('greece');
    });

    it('vatican', async() => {
        expect(utility.replaceKnownCountryPie('vAtiCAN')).toStrictEqual('Vatican City State');
    });

    it('korea', async() => {
        expect(utility.replaceKnownCountryPie('korea')).toStrictEqual('South Korea');
    });

    it('korea2', async() => {
        expect(utility.replaceKnownCountryPie('soUTH koREA')).toStrictEqual('South Korea');
    });

    it('us', async() => {
        expect(utility.replaceKnownCountryPie('usa')).toStrictEqual('us');
    });
});

describe('removeMaliciousChars', () => {
    it('Should remove one evil char', async() => {
        expect(utility.removeMaliciousChars(['greece*'])).toStrictEqual(['greece']);
    });

    it('Should remove two evil char', async() => {
        expect(utility.removeMaliciousChars(['gre+ece*'])).toStrictEqual(['greece']);
    });

    it('Should remove two evil identical chars', async() => {
        expect(utility.removeMaliciousChars(['greece[['])).toStrictEqual(['greece']);
    });

    it('Should remove actual regex', async() => {
        expect(utility.removeMaliciousChars(['[A-Za-z]*'])).toStrictEqual(['AZaz']);
    });

    it('Should remove singe evil char', async() => {
        expect(utility.removeMaliciousChars(['*'])).toStrictEqual(['']);
    });
});

describe('shouldRefreshFile', () => {
    // Month and Day need to be incremented
    it('file was created a month ago should refresh', async() => {
        let today = new Date();
        let value = {
            month: today.getMonth(),
            day: today.getDay(),
            hour: today.getHours(),
        };
        expect(utility.shouldRefreshFile(value)).toBe(true);
    });

    it('file was created a day ago should refresh', async() => {
        let today = new Date();
        let value = {
            month: today.getMonth() + 1,
            day: today.getDay() - 1,
            hour: today.getHours(),
        };
        expect(utility.shouldRefreshFile(value)).toBe(true);
    });

    it('file was created 6 hours ago should refresh', async() => {
        let today = new Date();
        let value = {
            month: today.getMonth() + 1,
            day: today.getDay(),
            hour: today.getHours() - 6,
        };
        expect(utility.shouldRefreshFile(value)).toBe(true);
    });

    it('file was created less than 6 hours ago should not refresh', async() => {
        let today = new Date();
        let value = {
            month: today.getMonth() + 1,
            day: today.getDate(),
            hour: today.getHours() - 5,
        };
        expect(utility.shouldRefreshFile(value)).toBe(false);
    });
});
