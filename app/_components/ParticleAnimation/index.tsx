// Fun particle animation
// Rather than importing whole library, just using component from here:
// https://uiball.com/ldrs/

import React from 'react'
import styles from './particleAnimation.module.css'

export default function ParticleAnimation() {
  return (
    <div className={styles.container}>
      {/* Generate particles dynamically if you need more or fewer particles */}
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
      <div className={styles.particle}></div>
    </div>
  )
}
