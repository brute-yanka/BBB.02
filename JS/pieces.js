let pieces = [
    //WHITE
    {
        name: 'wp',
        position: ['12', '22', '32', '42', '52', '62', '72', '82'],
        points: 1,
        moves: [0, 1],
        steps: 3
    },
    {
        name: 'wr',
        position: ['11', '81'],
        points: 3,
        moves: [0, 1, 0, -1, 0],
        steps: 12
    },
    {
        name: 'wn',
        position: ['21', '71'],
        points: 2,
        moves: [2, 1, 2, -1, -2, 1, -2, -1, 2],
        steps: 1
    },
    {
        name: 'wb',
        position: ['31', '61'],
        points: 2,
        moves: [1, 1, -1, -1, 1],
        steps: 8
    },
    {
        name: 'wq',
        position: ['51'],
        points: 5,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 12
    },
    {
        name: 'wk',
        position: ['41'],
        points: 2,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 2
    },
    //BLACK
    {
        name: 'bp',
        position: ['111', '211', '311', '411', '511', '611', '711', '811'],
        points: 1,
        moves: [0, 1],
        steps: 3
    },
    {
        name: 'br',
        position: ['112', '812'],
        points: 3,
        moves: [0, 1, 0, -1, 0],
        steps: 12
    },
    {
        name: 'bn',
        position: ['212', '712'],
        points: 2,
        moves: [2, 1, 2, -1, -2, 1, -2, -1, 2],
        steps: 1
    },
    {
        name: 'bb',
        position: ['312', '612'],
        points: 2,
        moves: [1, 1, -1, -1, 1],
        steps: 8
    },
    {
        name: 'bq',
        position: ['512'],
        points: 5,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 12
    },
    {
        name: 'bk',
        position: ['412'],
        points: 2,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 2
    }
];