import React, { Component } from 'react';
import Card from '../Card/Card';
import {areSuitsStackable, areNumbersStackable} from '../GameLogic.js';
import './Cell.css';
import './Tableau.css';

class Tableau extends Component {
  constructor(props) {
    super(props);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  computePosition(index) {
    return {
      top: index * 20
    };
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDrop(e) {
    e.preventDefault();
    var position = e.dataTransfer.getData("text");
    this.props.onAttemptMoveCard(position, this.props.tableauNumber);
  }

  // Returns list of true/false for each card by index. True if selectable. False if not.
  getCardsSelectability(cards, maxMoveableCards) {
    let isCardSelectableList = Array(cards.length).fill(false);


    // Start at end of tableau because the selectability of more nested cards
    // depends on the ones laying on top of them.
    for (var i = cards.length - 1; i >= 0; i--) {
      let isCardSelectable = false;

      // Very bottom card is always selectable
      if (i === cards.length - 1) {
        isCardSelectable = true;
      }
      // For all cards except the first one
      else {
        let cardDepth = cards.length - i;
        let card = cards[i];
        let cardBelowIndex = i + 1;
        let cardBelow = cards[cardBelowIndex];
        if (cardDepth <= maxMoveableCards
            && areSuitsStackable(card.suit, cardBelow.suit)
            && areNumbersStackable(card.number, cardBelow.number)
            && isCardSelectableList[cardBelowIndex] === true) {

          isCardSelectable = true;
        }
      }
      isCardSelectableList[i] = isCardSelectable;
    }

    return isCardSelectableList;
  }

  render() {
    let isCardSelectableList = this.getCardsSelectability(this.props.cards, this.props.maxMoveableCards);

    return (
      <div className="Tableau" onDragOver={this.onDragOver} onDrop={this.onDrop}>
        <div className="empty-cell"></div>
        {this.props.cards.map((card, index) =>
          <div className="Tableau-positioner" style={this.computePosition(index)} key={card.number + card.suit}>
            <Card
              position={`TABLEAU:${this.props.tableauNumber}/${index}`}
              suit={card.suit}
              number={card.number}
              isSelectable={isCardSelectableList[index]}>
            </Card>
          </div>
        )}
      </div>
    );
  }
}

export default Tableau;
