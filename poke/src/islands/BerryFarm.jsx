import { berryProgress, isBerryReady, BERRY_YIELD } from '../storage.jsx'

// きのみ栽培：きのみを植えて、じかんがたつと収穫できる
export default function BerryFarm({ resort }) {
  const { state, now, plantBerry, harvestBerry } = resort

  return (
    <div className="island">
      <p className="island-lead">
        きのみを植えて育てよう！ もっているきのみ: {state.berries}こ
      </p>

      <div className="plot-grid">
        {state.plots.map((plot, i) => {
          const empty = plot.plantedAt == null
          const ready = isBerryReady(plot, now)
          const progress = berryProgress(plot, now)

          return (
            <div
              key={i}
              className={`plot ${empty ? 'plot-empty' : ready ? 'plot-ready' : 'plot-growing'}`}
            >
              {empty ? (
                <div className="plot-emoji">さら地</div>
              ) : (
                <img
                  className="plot-sprite"
                  src={
                    import.meta.env.BASE_URL +
                    (ready ? 'Planet/3.png' : progress < 0.5 ? 'Planet/1.png' : 'Planet/2.png')
                  }
                  alt={ready ? 'みのった' : 'なえ'}
                />
              )}

              {!empty && !ready && (
                <div className="bar grow-bar">
                  <span
                    className="bar-fill"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}

              {empty && (
                <button onClick={() => plantBerry(i)}>植える</button>
              )}
              {ready && (
                <button className="harvest" onClick={() => harvestBerry(i)}>
                  しゅうかく +{BERRY_YIELD}
                </button>
              )}
              {!empty && !ready && <small>育成中…</small>}
            </div>
          )
        })}
      </div>

      <p className="hint">
        収穫したきのみは「なかよし島」でポケモンにあげられるよ。
      </p>
    </div>
  )
}
