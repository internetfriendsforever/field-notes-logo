import ADSREnvelope from 'adsr-envelope'

export default function createInstrument (context) {
  const gain = context.createGain()
  const oscillators = ~~(1 + Math.random() * 2)

  const adsr = new ADSREnvelope({
    attackTime: 0.005 + Math.random() * 0.002,
    decayTime: 0.2 + Math.random() * 0.5,
    sustainLevel: 0.0 + Math.random() * 0.5,
    releaseTime: 0.01 + Math.random() * 0.2,
    gateTime: 0.02,
    peakLevel: 1 / oscillators,
    epsilon: 0,
    attackCurve: 'exp',
    decayCurve: 'lin',
    releaseCurve: 'exp'
  })

  Array(oscillators).fill().map((v, i) => {
    const oscillator = context.createOscillator()
    const oscgain = context.createGain()
    const base = 80 + Math.random() * 400

    oscgain.gain.value = 0.2 + Math.random() * 0.8

    oscillator.frequency.value = base * Math.pow(i + 1, 2)
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
