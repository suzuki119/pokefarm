import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import {
  Center,
  Environment,
  OrbitControls,
  useCursor,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'

const GROUND_URL = '/kusa.glb'

// kusa.glb を、島の上面が y=0 に来るように置く
function Ground({ groundRef }) {
  const { scene } = useGLTF(GROUND_URL)
  return (
    <Center bottom scale={1.2} ref={groundRef}>
      <primitive object={scene} />
    </Center>
  )
}

// (x, z) の真上からレイを落として島の表面の高さを求める。
// レイは草の葉や（両面マテリアルのため）島の底にも当たるので、
// 「上を向いた面のうちいちばん低いヒット」＝地面の表面を採用する
const DOWN = new THREE.Vector3(0, -1, 0)
function groundYAt(ground, x, z) {
  const hits = new THREE.Raycaster(
    new THREE.Vector3(x, 20, z),
    DOWN,
  ).intersectObject(ground, true)
  const n = new THREE.Vector3()
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i]
    n.copy(h.face.normal).transformDirection(h.object.matrixWorld)
    if (n.y > 0.2) return h.point.y
  }
  return 0
}

// 前面URL(.../pokemon/1.png)から背面URL(.../pokemon/back/1.png)を導く
// （imageBack を保存する前に追加した既存ポケモンでも背面を出すため）
function backUrlOf(mon) {
  if (mon.imageBack) return mon.imageBack
  return mon.image?.replace('/pokemon/', '/pokemon/back/') ?? mon.image
}

// ドット絵を「向き固定の紙看板」に。表に前面スプライト・裏に背面スプライトを貼る
function PaperMon({ mon, groundRef, onSelect }) {
  const loaded = useLoader(THREE.TextureLoader, [mon.image, backUrlOf(mon)])
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  // useLoader のキャッシュは共有物なので、複製してからドット絵向けの設定をする
  const [front, back] = useMemo(
    () =>
      loaded.map((t, i) => {
        const tex = t.clone()
        tex.magFilter = tex.minFilter = THREE.NearestFilter // カクカク感を保つ
        tex.colorSpace = THREE.SRGBColorSpace
        if (i === 1) {
          // 裏面は板の後ろから見るので、左右反転して自然な向きにする
          tex.wrapS = THREE.RepeatWrapping
          tex.repeat.x = -1
        }
        tex.needsUpdate = true
        return tex
      }),
    [loaded],
  )

  // 島の起伏に沿わせる：立ち位置の地面の高さを拾って足もとを合わせる
  const ref = useRef()
  useLayoutEffect(() => {
    const ground = groundRef.current
    if (!ground || !ref.current) return
    ground.updateWorldMatrix(true, true)
    ref.current.position.y = groundYAt(ground, mon.x, mon.z)
  }, [groundRef, mon.x, mon.z])

  // スプライトの縦横比から板の大きさを決める
  const height = 1.5
  const img = front.image
  const width = height * (img?.width ? img.width / img.height : 1)

  return (
    <group ref={ref} position={[mon.x, 0, mon.z]}>
      {/* 足もとの影 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[width * 0.42, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      {/* 向き固定の紙看板（+Z が前面）。表裏で別スプライト */}
      <group
        position={[0, height / 3, 0]}
        scale={hovered ? 1.12 : 1}
        onClick={(e) => (e.stopPropagation(), onSelect(mon))}
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={front}
            transparent
            alphaTest={0.5}
            side={THREE.FrontSide}
            roughness={0.9}
          />
        </mesh>
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={back}
            transparent
            alphaTest={0.5}
            side={THREE.BackSide}
            roughness={0.9}
          />
        </mesh>
      </group>
    </group>
  )
}

// イーストク島ふうの3D画面：紙のポケモンが草地の上に立ちならぶ
export default function IslandScene({ resort }) {
  const { state } = resort
  const [selected, setSelected] = useState(null)
  const groundRef = useRef()

  // ポケモンを島の中央寄り（平らな面）にばらまく
  const placed = useMemo(() => {
    const total = state.pokemons.length
    return state.pokemons.map((p, i) => {
      const angle = (i / Math.max(total, 1)) * Math.PI * 2 + (i % 3) * 0.4
      const r = 0.8 + (i % 3) * 0.7
      return { ...p, x: Math.cos(angle) * r, z: Math.sin(angle) * r }
    })
  }, [state.pokemons])

  return (
    <div className="scene">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 6, 9], fov: 42 }}
        onPointerMissed={() => setSelected(null)}
      >
        <color attach="background" args={['#8fd3f0']} />
        <fog attach="fog" args={['#8fd3f0', 16, 30]} />

        <Suspense fallback={null}>
          {/* park の環境マップで全体を明るくやわらかく照らす */}
          <Environment preset="park" environmentIntensity={1.1} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <Ground groundRef={groundRef} />
          {placed.map((p) => (
            <PaperMon
              key={p.id}
              mon={p}
              groundRef={groundRef}
              onSelect={setSelected}
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={16}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.6, 0]}
        />
      </Canvas>

      {/* えらんだポケモンの吹き出し */}
      {selected && (
        <div className="mon-popup" onClick={() => setSelected(null)}>
          <img src={selected.image} alt={selected.nameJa} />
          <strong>{selected.nameJa}</strong>
          <small>なかよし度 {selected.friendship}/100</small>
        </div>
      )}
    </div>
  )
}

useGLTF.preload(GROUND_URL)
