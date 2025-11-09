import React from 'react'
import styles from './page.module.css' // Import the styles
import { Model } from '../model'

function ClosedAuction({ model }: { model: Model }) {
  return (
    // Use the same .page and .main classes as page.tsx
    // This will center it and apply the page background
    <div className={styles.page}>
      <main className={styles.main}>
        {/* We'll add a specific class here to style this "card"
          in the CSS file.
        */}
        <div className={styles.auctionClosedCard}>
          <h1>Auction is Closed</h1>
          {/* This <p> tag will be styled by the new CSS rule 
            to be large and white.
          */}
          <p>Total Funds Raised: ${model.totalFundsRaised}</p>
        </div>
      </main>
    </div>
  )
}

export { ClosedAuction }