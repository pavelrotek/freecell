import { ALL_SUITS, ALL_NUMBERS } from "./Common.js";

export let solution = [];

/*
c - cross
d - diamond
s - spades
h - herz
*/
// A sorted deck of cards
const SORTED_DECK = (function () {
  let arr = [];
  arr.push({ suit: "d", number: "9" });
  arr.push({ suit: "d", number: "8" });
  arr.push({ suit: "s", number: "5" });
  arr.push({ suit: "d", number: "4" });
  arr.push({ suit: "d", number: "Q" });
  arr.push({ suit: "c", number: "7" });
  arr.push({ suit: "h", number: "2" });
  arr.push({ suit: "h", number: "6" });

  arr.push({ suit: "d", number: "7" });
  arr.push({ suit: "h", number: "Q" });
  arr.push({ suit: "c", number: "2" });
  arr.push({ suit: "h", number: "4" });
  arr.push({ suit: "h", number: "7" });
  arr.push({ suit: "c", number: "K" });
  arr.push({ suit: "s", number: "7" });
  arr.push({ suit: "c", number: "Q" });

  arr.push({ suit: "h", number: "K" });
  arr.push({ suit: "s", number: "Q" });
  arr.push({ suit: "c", number: "10" });
  arr.push({ suit: "s", number: "K" });
  arr.push({ suit: "d", number: "10" });
  arr.push({ suit: "d", number: "J" });
  arr.push({ suit: "s", number: "6" });
  arr.push({ suit: "h", number: "A" });

  arr.push({ suit: "d", number: "3" });
  arr.push({ suit: "s", number: "A" });
  arr.push({ suit: "d", number: "A" });
  arr.push({ suit: "s", number: "3" });
  arr.push({ suit: "s", number: "4" });
  arr.push({ suit: "s", number: "10" });
  arr.push({ suit: "d", number: "2" });
  arr.push({ suit: "h", number: "8" });

  arr.push({ suit: "d", number: "5" });
  arr.push({ suit: "h", number: "9" });
  arr.push({ suit: "s", number: "J" });
  arr.push({ suit: "h", number: "J" });
  arr.push({ suit: "c", number: "4" });
  arr.push({ suit: "h", number: "3" });
  arr.push({ suit: "s", number: "2" });
  arr.push({ suit: "c", number: "A" });

  arr.push({ suit: "c", number: "8" });
  arr.push({ suit: "c", number: "6" });
  arr.push({ suit: "c", number: "J" });
  arr.push({ suit: "h", number: "10" });
  arr.push({ suit: "s", number: "9" });
  arr.push({ suit: "c", number: "9" });
  arr.push({ suit: "d", number: "K" });
  arr.push({ suit: "s", number: "8" });

  arr.push({ suit: "c", number: "5" });
  arr.push({ suit: "d", number: "6" });
  arr.push({ suit: "h", number: "5" });
  arr.push({ suit: "c", number: "3" });

  arr.reverse();
  return arr;
})();

export function getMoves() {
  return solution.map((item) => item.movedCard);
}

export function resetSolutionToSnapshot(idx) {
  solution = solution.slice(0, idx + 1);
}

// Get a random dealing of cards and array of 8 arrays (one for each tableau)
export function getRandomCardDeal() {
  // Get a new deck and shuffle it
  let newDeck = SORTED_DECK.slice();
  //  newDeck = shuffleArray(newDeck);

  // Initial card positions is an array of 8 arrays (for each tableau)
  let cardTableaux = [[], [], [], [], [], [], [], []];
  let tableau = 0;

  // Distribute the shuffled deck into the card tableaus
  while (newDeck.length > 0) {
    cardTableaux[tableau].push(newDeck.pop());
    tableau = tableau >= 7 ? 0 : tableau + 1;
  }

  return cardTableaux;
}

// Check if a given move to a tableau is going to be valid or not
export function isValidMoveToTableau(state, position, newTableauNumber) {
  let parsedPosition = parsePosition(position);

  if (isValidMoveFromPosition(state, parsedPosition, false)) {
    let cardToMove = getCardForPosition(state, parsedPosition);

    let landTableau = state.cardTableaux[newTableauNumber];

    // If tableau is empty, calc max moveable cards less one tableau
    if (landTableau.length === 0) {
      if (
        parsedPosition.stack === "FOUNDATION" ||
        parsedPosition.stack === "OPEN"
      ) {
        return true;
      } else {
        let maxMoveableCards = calculateMaxMoveableCardsToEmptyTableau(
          state.cardTableaux,
          state.openCells
        );
        let cardDepth =
          state.cardTableaux[parsedPosition.stackIndex].length -
          parsedPosition.itemIndex;
        return cardDepth <= maxMoveableCards;
      }
    }
    // If tableau has cards already, make sure they match up
    else {
      let cardToLand = landTableau[landTableau.length - 1];

      return areCardsStackable(cardToLand, cardToMove);
    }
  }
  return false;
}

// Move a card from one location to another tableau
export function executeMoveToTableau(
  state,
  position,
  newTableauNumber,
  makeStateCopy = true
) {
  let newState = makeStateCopy ? Object.assign({}, state) : state;
  let cardsToMove = removeCardsAtPosition(newState, position);

  // Push card onto end of new tableau
  newState.cardTableaux[newTableauNumber].push(...cardsToMove);
  newState.movedCard = cardsToMove;
  newState.movedCard.push("K");

  solution.push(JSON.parse(JSON.stringify(newState)));

  return newState;
}

// Check if a given move to a foundation is going to be valid or not
export function isValidMoveToFoundation(state, position, foundationNumber) {
  let parsedPosition = parsePosition(position);

  if (isValidMoveFromPosition(state, parsedPosition, true)) {
    let cardToMove = getCardForPosition(state, parsedPosition);
    let foundationCard = state.foundationCells[foundationNumber];

    // Check if we are placing the card in the right foundation slot (by suit)
    if (cardToMove.suit === ALL_SUITS[foundationNumber]) {
      if (foundationCard === null) {
        return cardToMove.number === "A";
      } else {
        return areNumbersStackable(cardToMove.number, foundationCard.number);
      }
    }
  }
  return false;
}

// Move a card from one location to a foundation slot
export function executeMoveToFoundation(
  state,
  position,
  foundationNumber,
  makeStateCopy = true
) {
  let newState = makeStateCopy ? Object.assign({}, state) : state;
  let cardsToMove = removeCardsAtPosition(newState, position);

  // Assign card to the foundation slot
  newState.foundationCells[foundationNumber] = cardsToMove[0];
  newState.movedCard = cardsToMove;
  newState.movedCard.push("F");

  solution.push(JSON.parse(JSON.stringify(newState)));

  return newState;
}

// Check if a given move to an open cell is going to be valid or not
export function isValidMoveToOpenCell(state, position, openCellNumber) {
  let parsedPosition = parsePosition(position);

  if (isValidMoveFromPosition(state, parsedPosition, true)) {
    let openCellCard = state.openCells[openCellNumber];

    // Check if open cell is empty
    return openCellCard === null;
  }
  return false;
}

// Move a card from one location to an open cell
export function executeMoveToOpenCell(
  state,
  position,
  openCellNumber,
  makeStateCopy = true
) {
  let newState = makeStateCopy ? Object.assign({}, state) : state;
  let cardsToMove = removeCardsAtPosition(newState, position);

  // Assign card to the open cell
  newState.openCells[openCellNumber] = cardsToMove[0];
  newState.movedCard = cardsToMove;
  newState.movedCard.push("VP");

  solution.push(JSON.parse(JSON.stringify(newState)));
  return newState;
}

export function moveAllPossibleCardsToFoundation(state) {
  let newState = Object.assign({}, state);

  let uncheckedCards = getPositionsOfAllTopCards(newState);
  let checkedCards = [];

  // Cycle through all top cards until we have checked all of them
  while (true) {
    if (uncheckedCards.length === 0) {
      return newState;
    }

    let cardPosition = uncheckedCards.pop();
    let cardToCheck = getCardForPosition(newState, cardPosition);
    let foundationNumber = ALL_SUITS.indexOf(cardToCheck.suit);

    // If it is valid to move card to foundation
    if (isValidMoveToFoundation(newState, cardPosition, foundationNumber)) {
      // Move card to foundation
      executeMoveToFoundation(newState, cardPosition, foundationNumber, false);

      // If not last card in tableau, point cardPosition to the one below this card,
      // and add it to the list of uncheckedCards
      if (cardPosition.stack === "TABLEAU" && cardPosition.itemIndex !== 0) {
        cardPosition.itemIndex--;
        uncheckedCards.push(cardPosition);
      }

      // Since we have added a new card to the foundation, must check all checkedCards again
      uncheckedCards = checkedCards.concat(uncheckedCards);
      checkedCards = [];
    }
    // If not possible to move card to foundation, add this card to chekedCards for use later
    else {
      checkedCards.push(cardPosition);
    }
  }
}

// Get an array of the parsed positions of all cards on the top of a tableau or in an open cell
function getPositionsOfAllTopCards(state) {
  let cardPositions = [];
  state.cardTableaux.forEach((tableau, tableauIndex) => {
    if (tableau.length !== 0)
      cardPositions.push({
        stack: "TABLEAU",
        stackIndex: tableauIndex,
        itemIndex: tableau.length - 1,
      });
  });

  state.openCells.forEach((openCell, openCellIndex) => {
    if (openCell !== null)
      cardPositions.push({
        stack: "OPEN",
        stackIndex: openCellIndex,
      });
  });

  return cardPositions;
}

// Parse the position string
function parsePosition(position) {
  // Check if position is already parsed
  if (typeof position === "object" && position.hasOwnProperty("stack")) {
    return position;
  }

  let [stack, stackIndex] = position.split(":");
  if (stack === "TABLEAU") {
    let [tableauNumber, index] = stackIndex.split("/");
    return {
      stack: "TABLEAU",
      stackIndex: parseInt(tableauNumber, 10),
      itemIndex: parseInt(index, 10),
    };
  } else {
    return {
      stack: stack,
      stackIndex: parseInt(stackIndex, 10),
    };
  }
}

function isValidMoveFromPosition(state, position, topCardOnly = false) {
  switch (position.stack) {
    case "TABLEAU":
      let moveTableau = state.cardTableaux[position.stackIndex];
      let maxMoveableCards = calculateMaxMoveableCards(
        state.cardTableaux,
        state.openCells
      );

      // If move is valid only if it is the top card, check here and return
      if (topCardOnly) {
        return position.itemIndex === moveTableau.length - 1;
      }

      return areTableauCardsMoveable(moveTableau, maxMoveableCards, position);

    // Initially, you cannot move cards down from the foundation
    case "FOUNDATION":
      return false;

    // You can move a card from an open cell if there exists a card in it
    case "OPEN":
      return state.openCells[position.stackIndex] !== null;

    default:
      console.error(`Invalid stack type: ${position.stack}`);
      return false;
  }
}

// For given tableau and card position, returns true if valid to move stack of cards starting at card position
function areTableauCardsMoveable(tableau, maxMoveableCards, position) {
  let cardDepth = tableau.length - position.itemIndex;

  if (cardDepth > maxMoveableCards) {
    return false;
  }

  // Check that for each card, the one below it is valid (i.e. one number less and opposite suit color)
  for (var i = position.itemIndex; i < tableau.length - 1; i++) {
    let cardAbove = tableau[i];
    let cardBelow = tableau[i + 1];
    if (!areCardsStackable(cardAbove, cardBelow)) {
      return false;
    }
  }
  return true;
}

function getCardForPosition(state, position) {
  switch (position.stack) {
    case "TABLEAU":
      return state.cardTableaux[position.stackIndex][position.itemIndex];
    // More logic here about moving "from", i.e. stacked cards (but maybe put this in onDrag handler)
    case "FOUNDATION":
      return state.foundationCells[position.stackIndex];
    case "OPEN":
      return state.openCells[position.stackIndex];
    default:
      console.error(`Invalid stack type: ${position.stack}`);
      return null;
  }
}

// Given a game state, remove a card at position and return it
function removeCardsAtPosition(state, position) {
  let parsedPosition = parsePosition(position);
  let cardToMove = getCardForPosition(state, parsedPosition);

  switch (parsedPosition.stack) {
    // For a tableau, remove all cards below position and return as array
    case "TABLEAU":
      let allCardsToMove = [];
      do {
        var currentCard = state.cardTableaux[parsedPosition.stackIndex].pop();
        allCardsToMove.push(currentCard);
      } while (currentCard !== cardToMove);

      return allCardsToMove.reverse();

    case "FOUNDATION":
      state.foundationCells[parsedPosition.stackIndex] = null;
      return [cardToMove];

    case "OPEN":
      state.openCells[parsedPosition.stackIndex] = null;
      return [cardToMove];

    default:
      console.error(`Invalid stack type: ${parsedPosition.stack}`);
      return [null];
  }
}

// Helper function takes two suits and returns true if they are opposite colors
// and thus are allowed to be stacked
export function areSuitsStackable(suit1, suit2) {
  switch (suit1) {
    case "h":
    case "d":
      return suit2 === "s" || suit2 === "c";
    case "s":
    case "c":
      return suit2 === "h" || suit2 === "d";
    default:
      console.error(`Invalid suit types suit1: ${suit1}, suit2: ${suit2}`);
      return false;
  }
}

// Helper function takes two number and returns true if they are sequential
// and thus are allowed to be stacked
export function areNumbersStackable(numberHigher, numberLower) {
  return (
    ALL_NUMBERS.indexOf(numberLower) !== 12 &&
    ALL_NUMBERS.indexOf(numberLower) === ALL_NUMBERS.indexOf(numberHigher) - 1
  );
}

export function areCardsStackable(baseCard, cardToStack) {
  if (baseCard == null) {
    return true;
  }

  return (
    areSuitsStackable(baseCard.suit, cardToStack.suit) &&
    areNumbersStackable(baseCard.number, cardToStack.number)
  );
}

export function calculateMaxMoveableCards(cardTableaux, openCells) {
  let numEmptyTableaux = cardTableaux
    .map((tableau) => tableau.length)
    .filter((length) => length === 0).length;
  let numEmptyOpenCells = openCells.filter(
    (openCell) => openCell === null
  ).length;

  return (1 + numEmptyOpenCells) * 2 ** numEmptyTableaux;
}

function calculateMaxMoveableCardsToEmptyTableau(cardTableaux, openCells) {
  let numEmptyTableaux = cardTableaux
    .map((tableau) => tableau.length)
    .filter((length) => length === 0).length;
  let numEmptyOpenCells = openCells.filter(
    (openCell) => openCell === null
  ).length;

  return (1 + numEmptyOpenCells) * 2 ** Math.max(0, numEmptyTableaux - 1);
}

// Checks if the game state is a Win by examining the foundation cells
export function checkIfVictorious(foundationCells) {
  return foundationCells.every((card) => card && card.number === "K");
}
