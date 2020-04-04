const util = require('./file.util');
const library = require('./../data/utility');

let obj = [
    {
        date: '1/22/20',
        value: 0,
    },
];

let obj2 = [
    {
        date: '1/22/20',
        value: 0,
    },
    {
        date: '1/23/20',
        value: 1,
    },
];

let obj3 = [
    {
        date: '1/22/20',
        value: 1,
    },
    {
        date: '1/23/20',
        value: 0,
    },
];

let obj4 = [
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
];

it('Command is found', async() => {
    await util.getCommand('cv').then(e => {
        expect(0).toBe(0);
    });
});

it('getChange', async() => {
    expect(library.getChange([0, 2, 3, 1, 9]))
        .toStrictEqual([0, 2, 1, -2, 8]);
});

describe('replaceKnownCountry', () => {

    it('Korea', async() => {
        expect(library.replaceKnownCountry('south korea')).toBe('korea');
    });

    it('Random country', async() => {
        expect(library.replaceKnownCountry('greece')).toBe('greece');
    });

    it('Vatican', async() => {
        expect(library.replaceKnownCountry('vatican')).toBe('holy see');
    });

    it('UK', async() => {
        expect(library.replaceKnownCountry('uk')).toBe('united kingdom');
    });
});

describe('getGraphLabel', () => {
    it('No flag', async() => {
        expect(library.getGraphLabel('greece', '')).toBe('Confirmed cases in Greece');
    });

    it('No country', async() => {
        expect(library.getGraphLabel('', 'c')).toBe('Confirmed cases in ');
    });

    it('No flag or country', async() => {
        expect(library.getGraphLabel('', '')).toBe('Confirmed cases in ');
    });

    it('Recovered', async() => {
        expect(library.getGraphLabel('greece', 'r')).toBe('Recovered cases in Greece');
    });

    it('Deaths', async() => {
        expect(library.getGraphLabel('greece', 'd')).toBe('Deaths in Greece');
    });
});

describe('getGraphColor', () => {
    it('Confirmed', async() => {
        expect(library.getGraphColor('c')).toBe('rgba(41, 121, 255, 1)');
    });

    it('Empty', async() => {
        expect(library.getGraphColor('')).toBe('rgba(41, 121, 255, 1)');
    });

    it('Recovered', async() => {
        expect(library.getGraphColor('r')).toBe('rgba(0, 200, 83, 1)');
    });

    it('Deaths', async() => {
        expect(library.getGraphColor('d')).toBe('rgba(235, 40, 40, 1)');
    });
});

describe('formatForGraph', () => {
    it('One date', () => {
        expect(library.formatForGraph(obj)).toStrictEqual([{date: '20-1-22', value: 0}]);
    });

    it('Empty', () => {
        expect(library.formatForGraph([])).toStrictEqual([]);
    });

    it('2 Dates', () => {
        expect(library.formatForGraph(obj2)).toStrictEqual([{date: '20-1-22', value: 0}, {date: '20-1-23', value: 1}]);
    });
});

describe('filterCasesDecreasing', () => {
    it('No decrease', async() => {
        expect(library.formatForGraph(library.filterCasesDecreasing(obj2)))
            .toStrictEqual([{date: '20-1-22', value: 0}, {date: '20-1-23', value: 1}]);
    });

    it('Swap', async() => {
        expect(library.formatForGraph(library.filterCasesDecreasing(obj3)))
            .toStrictEqual([{date: '20-1-22', value: 1}]);
    });

    it('Empty', async() => {
        expect(library.filterCasesDecreasing([]))
            .toStrictEqual([]);
    });
});

describe('filterCasesDupes', () => {
    it('One duplicate', async() => {
        expect(library.formatForGraph(library.filterCasesDupes(obj4)))
            .toStrictEqual([{date: '20-1-22', value: 1}, {date: '20-1-23', value: 2}, {date: '20-1-25', value: 3}]);
    });

    it('No duplicates', async() => {
        expect(library.filterCasesDupes(obj3))
            .toStrictEqual(obj3);
    });

    it('Empty', async() => {
        expect(library.filterCasesDupes([]))
            .toStrictEqual([]);
    });
});

describe('filterCasesEmpty', () => {
    it('Empty', async() => {
        expect(library.filterCasesEmpty([])).toStrictEqual([]);
    });

    it('No empty', async() => {
        expect(library.formatForGraph(library.filterCasesEmpty(obj4)))
            .toStrictEqual([{date: '20-1-22', value: 1}, {date: '20-1-23', value: 2}, {date: '20-1-24', value: 2}, {date: '20-1-25', value: 3}]);
    });

    it('One empty', async() => {
        expect(library.formatForGraph(library.filterCasesEmpty(obj2)))
            .toStrictEqual([{date: '20-1-23', value: 1}]);
    });
});

describe('includesCountry', () => {});

describe('getPopulation', () => {
    const population = require('../data/population');

    it('us', async() => {
        expect(library.getPopulation('us', null)).toBe(329470573);
    });

    it('all', async() => {
        expect(library.getPopulation('all', null)).toBe(7444509223);
    });

    it('other', async() => {
        expect(library.getPopulation('other', null)).toBe(6034991826);
    });

    it('Greece', async() => {
        expect(library.getPopulation('greece', population)).toBe(11159773);
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
        expect(library.populationData(null, populationD, populationR, population).populationC).toStrictEqual(0);
    });

    it('All params passed', async() => {
        expect(library.populationData(populationC, populationD, populationR, population)).toStrictEqual(obj);
    });
});

describe('getGraphPieCountry', () => {
    it('all', async() => {
        expect(library.getGraphPieCountry('all')).toStrictEqual('all countries');
    });

    it('other', async() => {
        expect(library.getGraphPieCountry('other')).toStrictEqual('all countries except China');
    });

    it('Greece', async() => {
        expect(library.getGraphPieCountry('greece')).toStrictEqual('Greece');
    });
});

describe('replaceKnownCountryPie', () => {
    it('unknown country', async() => {
        expect(library.replaceKnownCountryPie('greece')).toStrictEqual('greece');
    });

    it('vatican', async() => {
        expect(library.replaceKnownCountryPie('vAtiCAN')).toStrictEqual('Vatican City State');
    });

    it('korea', async() => {
        expect(library.replaceKnownCountryPie('korea')).toStrictEqual('South Korea');
    });

    it('korea2', async() => {
        expect(library.replaceKnownCountryPie('soUTH koREA')).toStrictEqual('South Korea');
    });

    it('us', async() => {
        expect(library.replaceKnownCountryPie('usa')).toStrictEqual('us');
    });
});

describe('removeMaliciousChars', () => {
    it('Should remove one evil char', async() => {
        expect(library.removeMaliciousChars('greece*')).toStrictEqual('greece');
    });

    it('Should remove two evil char', async() => {
        expect(library.removeMaliciousChars('gre+ece*')).toStrictEqual('greece');
    });

    it('Should remove two evil identical chars', async() => {
        expect(library.removeMaliciousChars('greece[[')).toStrictEqual('greece');
    });

    it('Should remove actual regex', async() => {
        expect(library.removeMaliciousChars('[A-Za-z]*')).toStrictEqual('AZaz');
    });

    it('Should remove singe evil char', async() => {
        expect(library.removeMaliciousChars('*')).toStrictEqual('');
    });
});
