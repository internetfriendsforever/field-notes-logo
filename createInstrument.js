function createInstrument (context) {
  const gain = context.createGain()
  const oscillators = ~~(2 + Math.random() * 4)

  const adsr = new ADSREnvelope({
    attackTime: 0.005 + Math.random() * 0.002,
    decayTime: 0.1 + Math.random() * 0.5,
    sustainLevel: 0.1 + Math.random() * 0.5,
    releaseTime: 0.1 + Math.random() * 0.2,
    gateTime: 0.01,
    peakLevel: 1 / oscillators,
    epsilon: 0,
    attackCurve: 'exp',
    decayCurve: 'lin',
    releaseCurve: 'exp'
  })

  Array(oscillators).fill().map((v, i) => {
    const oscillator = context.createOscillator()
    const oscgain = context.createGain()
    const base = (80 + Math.random() * 200) + Math.random() * 200

    oscgain.gain.value = Math.random()

    oscillator.frequency.value = base * Math.pow(i, 2)
    oscillator.type = 'sine'
    oscillator.connect(oscgain)
    oscillator.start()

    oscgain.connect(gain)
  })

  gain.gain.value = 0

  return {
    gain: gain,
    connect: destination => gain.connect(destination),
    trigger: value => {
      adsr.peakLevel = Math.min(1, value) / oscillators
      adsr.applyTo(gain.gain, context.currentTime)
    }
  }
}
