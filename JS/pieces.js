let pieces = [
    // ========== WHITE PIECES ==========
    //Pawn
    {
        name: 'wp',
        position: ['12', '22', '32', '42', '52', '62', '72', '82'],
        points: 1,
        moves: [0, 1],
        steps: 3
    },
    //Rook
    {
        name: 'wr',
        position: ['11', '81'],
        points: 3,
        moves: [0, 1, 0, -1, 0],
        steps: 12
    },
    //Knight
    {
        name: 'wn',
        position: ['21', '71'],
        points: 2,
        moves: [2, 1, 2, -1, -2, 1, -2, -1, 2],
        steps: 1
    },
    //Bishop
    {
        name: 'wb',
        position: ['31', '61'],
        points: 2,
        moves: [1, 1, -1, -1, 1],
        steps: 8
    },
    //Queen
    {
        name: 'wq',
        position: ['51'],
        points: 5,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 12
    },
    //King
    {
        name: 'wk',
        position: ['41'],
        points: 2,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 2
    },
    // ========== BLACK PIECES ==========
    //Pawn
    {
        name: 'bp',
        position: ['111', '211', '311', '411', '511', '611', '711', '811'],
        points: 1,
        moves: [0, 1],
        steps: 3
    },
    //Knight
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
    //Bishop
    {
        name: 'bb',
        position: ['312', '612'],
        points: 2,
        moves: [1, 1, -1, -1, 1],
        steps: 8
    },
    //Queen
    {
        name: 'bq',
        position: ['512'],
        points: 5,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 12
    },
    //King
    {
        name: 'bk',
        position: ['412'],
        points: 2,
        moves: [1, 1, -1, 0, -1, -1, 1, 0, 1],
        steps: 2
    }
];