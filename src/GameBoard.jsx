import React, { Component } from "react";
import Tableau from "./Cells/Tableau";
import FoundationCell from "./Cells/FoundationCell";
import OpenCell from "./Cells/OpenCell";
import VictoryBanner from "./VictoryBanner";
import { ALL_SUITS, suitShortToSymbolNameMap } from "./Common.js";
import * as gameLogic from "./GameLogic.js";
import "./GameBoard.css";

class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = { snapshots: [], ...this.getNewDealObject() };

    this.gameBoard = React.createRef();

    this.onClickDealNewHand = this.onClickDealNewHand.bind(this);
    this.attemptMoveCardToTableau = this.attemptMoveCardToTableau.bind(this);
    this.attemptMoveCardToFoundation =
      this.attemptMoveCardToFoundation.bind(this);
    this.attemptMoveCardToOpenCell = this.attemptMoveCardToOpenCell.bind(this);
    this.handleDblClickCard = this.handleDblClickCard.bind(this);
    this.handleLeftClickBoard = this.handleLeftClickBoard.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleMakeSnapshot = this.handleMakeSnapshot.bind(this);
    this.handleGoToSnapshot = this.handleGoToSnapshot.bind(this);
  }

  componentDidMount() {
    this.gameBoard.current.addEventListener(
      "double-click-card",
      this.handleDblClickCard
    );
  }

  componentWillUnmount() {
    this.gameBoard.current.removeEventListener(
      "double-click-card",
      this.handleDblClickCard
    );
  }

  onClickDealNewHand(e) {
    gameLogic.resetSolutionToSnapshot(0);
    this.setState(this.getNewDealObject());
  }

  getNewDealObject() {
    let state = {
      snapshots: [0],
      cardTableaux: gameLogic.getRandomCardDeal(),
      foundationCells: [null, null, null, null],
      openCells: [null, null, null, null],
    };
    gameLogic.solution.push(JSON.parse(JSON.stringify(state)));
    return state;
  }

  attemptMoveCardToTableau(position, newTableauNumber) {
    if (
      gameLogic.isValidMoveToTableau(this.state, position, newTableauNumber)
    ) {
      let newState = gameLogic.executeMoveToTableau(
        this.state,
        position,
        newTableauNumber
      );
      this.setState(newState);
    }
  }

  attemptMoveCardToFoundation(position, foundationNumber) {
    if (
      gameLogic.isValidMoveToFoundation(this.state, position, foundationNumber)
    ) {
      let newState = gameLogic.executeMoveToFoundation(
        this.state,
        position,
        foundationNumber
      );
      this.setState(newState);
    }
  }

  attemptMoveCardToOpenCell(position, openCellNumber) {
    if (gameLogic.isValidMoveToOpenCell(this.state, position, openCellNumber)) {
      let newState = gameLogic.executeMoveToOpenCell(
        this.state,
        position,
        openCellNumber
      );
      this.setState(newState);
    }
  }

  handleDblClickCard(e) {
    let position = e.detail.position;
    let foundationNumber = ALL_SUITS.indexOf(e.detail.suit);
    if (
      gameLogic.isValidMoveToFoundation(this.state, position, foundationNumber)
    ) {
      let newState = gameLogic.executeMoveToFoundation(
        this.state,
        position,
        foundationNumber
      );
      this.setState(newState);
    }
  }

  handleLeftClickBoard(e) {
    // This checks if this left click is actually fired from a Card left click
    if (!e.defaultPrevented) {
      e.preventDefault();
      let newState = gameLogic.moveAllPossibleCardsToFoundation(this.state);
      this.setState(newState);
    }
  }

  handleBack(e) {
    if (gameLogic.solution.length > 1) {
      gameLogic.solution.pop();
      let item = gameLogic.solution[gameLogic.solution.length - 1];
      this.setState(JSON.parse(JSON.stringify(item)));
    }
  }

  handleMakeSnapshot(e) {
    this.state.snapshots.push(gameLogic.solution.length - 1);
    this.setState({ snapshots: [...this.state.snapshots] });
  }

  handleGoToSnapshot(e) {
    if (this.state.snapshots.length > 0) {
      let item = this.state.snapshots[this.state.snapshots.length - 1];
      gameLogic.resetSolutionToSnapshot(item);
      this.setState(
        JSON.parse(
          JSON.stringify(gameLogic.solution[gameLogic.solution.length - 1])
        )
      );
    }
  }

  render() {
    console.log(this.state);
    let maxMoveableCards = gameLogic.calculateMaxMoveableCards(
      this.state.cardTableaux,
      this.state.openCells
    );
    let isVictorious = gameLogic.checkIfVictorious(this.state.foundationCells);
    return (
      <React.Fragment>
        <button onClick={this.onClickDealNewHand}>Nová hra</button>
        <div />
        <button onClick={this.handleMakeSnapshot}>Ulož pozici</button>
        <button onClick={this.handleGoToSnapshot}>Obnov pozici</button>
        <div>Počet pozic: {this.state.snapshots.length - 1}</div>

        <button onClick={this.handleBack}>Zpět</button>
        <div>Počet tahů: {gameLogic.solution.length - 1}</div>
        <div>
          {gameLogic.solution.map((item) => {
            if (item.movedCard) {
            const item0 = item.movedCard[0]
            const x = item.movedCard[1];
            const items = x.split('-');
            const item1 = items.length>0?{number:items[0],suit:items[1]}:x;            

            return (
              <>
                <span>{item0.number}</span>
                <span
                  style={{
                    color:
                      item0.suit === "d" ||
                      item0.suit === "h"
                        ? "red"
                        : "black",
                  }}
                >
                  {suitShortToSymbolNameMap[item.movedCard[0].suit]}
                </span>
                <span>{"->"}
                 {typeof (item1) === 'string' && (
                  <>{x}</>
                 )}
                 {!(typeof (item1) === 'string') && (<>
                 <span>{item1.number}</span>
                  <span
                   style={{
                    color:
                      item1.suit === "d" ||
                      item1.suit === "h"
                        ? "red"
                        : "black",
                  }}
                 >
                  {suitShortToSymbolNameMap[item1.suit]}
                 </span>
                  </>)}
                ,
                </span>
              </>
            ) 
            } else {
              return ""
            }
        })}
        </div>
        <div
          ref={this.gameBoard}
          className="GameBoard"
          onContextMenu={this.handleLeftClickBoard}
        >
          <div className="GameBoard-OpenCell">
            {this.state.openCells.map((card, index) => (
              <OpenCell
                key={ALL_SUITS[index]}
                openCellNumber={index}
                card={card}
                onAttemptMoveCard={this.attemptMoveCardToOpenCell}
              ></OpenCell>
            ))}
          </div>

          <div className="GameBoard-Foundation">
            {this.state.foundationCells.map((card, index) => (
              <FoundationCell
                key={ALL_SUITS[index]}
                foundationNumber={index}
                card={card}
                onAttemptMoveCard={this.attemptMoveCardToFoundation}
              ></FoundationCell>
            ))}
          </div>

          {this.state.cardTableaux.map((tableau, index) => (
            <Tableau
              key={index}
              cards={tableau}
              tableauNumber={index}
              maxMoveableCards={maxMoveableCards}
              onAttemptMoveCard={this.attemptMoveCardToTableau}
              attemptMoveToFoundation={this.attemptMoveToFoundation}
            ></Tableau>
          ))}

          {isVictorious && <VictoryBanner></VictoryBanner>}
        </div>
      </React.Fragment>
    );
  }
}

export default GameBoard;
