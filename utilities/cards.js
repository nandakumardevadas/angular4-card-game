var cards = {};
var deckCount = 3;
cards.createPack = function() {  
    var suits = new Array("H", "C", "S", "D");
    var pack = new Array();
    var n = 52;
    var index = n / suits.length;

    var count = 0;
    for(e = 1; e <= 3; e++)
        for(i = 0; i <= 3; i++)
            for(j = 1; j <= index; j++)
                pack[count++] = j + suits[i];

    return pack;  
}
  
cards.shufflePack = function(pack) {  
    var i = pack.length, j, tempi, tempj;
    if (i === 0) return false;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = pack[i];
        tempj = pack[j];
        pack[i] = tempj;
        pack[j] = tempi;
        }
    return pack;
}

cards.draw = function(pack, amount, hand, initial) {  
    var cards = new Array();
    cards = pack.slice(0, amount);

    pack.splice(0, amount);

    if (!initial) {
        hand.push.apply(hand, cards);
        //hand.concat(hand);
    }

    return cards;
}

cards.playCard = function(amount, hand, index) {
    for (var e in index) {
        var cardIndex = hand.indexOf(index[e]);
        hand.splice(cardIndex, amount);
    }
    return hand;
}

module.exports = cards;