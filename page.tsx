'use client'  // Next.js directive: This component runs on the client (in the browser).
import React from 'react'

import { Model} from '../model' // Import the data model class

import styles from "./page.module.css"
import { ToAuctionItems } from './boundary' // Import the main child component
import { ClosedAuction } from './closeauction' // Import the "closed" screen component

// BOUNDARY OBJECT (The main Page component)
export default function Home() {
 // Create the *single source of truth* for the application state.
 // The 'model' is stored in React's state.
 const [model, setModel] = React.useState(new Model())
 
 // This state is a trick to force React to re-render.
 // When andRefreshDisplay() is called, this state changes, forcing a redraw.
 const [redraw, forceRedraw] = React.useState(0)

 // State to track if the auction is finished.
 const [isAuctionClosed, setIsAuctionClosed] = React.useState(false)

 // This is the "controller" function passed to children.
 // When a child component mutates the model, it calls this function.
 function andRefreshDisplay() {
   // Changing the 'redraw' state value triggers a re-render of <Home />
   // This causes <Home /> to pass the *updated* 'model' prop to its children.
   forceRedraw(redraw + 1)
 }

 // Conditional Rendering: If 'isAuctionClosed' is true...
 if(isAuctionClosed){
  // ...render *only* the ClosedAuction component and stop.
  return <ClosedAuction model = {model}/>
 }

  // If the auction is not closed, render the main UI:
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {(model.itemsToAuction.length > 0 || model.getItemId(model.currentAuctionItem) != 0) ?
          (<div>
            {/* Pass the model and the refresh function down as props */}
            <ToAuctionItems model={model} andRefreshDisplay={andRefreshDisplay}/>
          </div>
          ) :
          <div>
            {/* Pass the model and the refresh function down as props */}
            <ToAuctionItems model={model} andRefreshDisplay={andRefreshDisplay}/>
            
            {/* The button to end the auction. */}
            {/* It's disabled if there are still items left in the 'itemsToAuction' list. */}
            <button disabled={model.itemsToAuction.length != 0} onClick={() => {setIsAuctionClosed(true)}}>Close Auction?</button>
          </div>
        }
      </main>
    </div>
  );
}