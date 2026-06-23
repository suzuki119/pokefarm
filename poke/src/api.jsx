const BASE_URL = 'https://pokeapi.co/api/v2'

// 日本語名 / 英語名 / 図鑑番号からポケモンを検索する
export async function searchPokemon(query) {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    throw new Error('検索キーワードを入力してください')
  }

  // 数字（図鑑番号）か英語名はそのまま、日本語名は species から英語名に変換する
  const identifier = /^[0-9]+$/.test(keyword)
    ? keyword
    : await resolveName(keyword)

  const res = await fetch(`${BASE_URL}/pokemon/${identifier}`)
  if (!res.ok) {
    throw new Error('ポケモンが見つかりませんでした')
  }
  const data = await res.json()

  // 日本語の名前・分類・説明文を取得する
  const speciesRes = await fetch(data.species.url)
  const species = speciesRes.ok ? await speciesRes.json() : null

  return {
    id: data.id,
    name: data.name,
    nameJa: pickJa(species?.names, 'name') ?? data.name,
    genusJa: pickJa(species?.genera, 'genus') ?? '',
    flavorJa: pickFlavor(species?.flavor_text_entries) ?? '',
    image: data.sprites.front_default,
    types: data.types.map((t) => translateType(t.type.name)),
    height: data.height / 10, // m
    weight: data.weight / 10, // kg
    stats: data.stats.map((s) => ({
      name: translateStat(s.stat.name),
      value: s.base_stat,
    })),
  }
}

// 日本語名を英語名（API識別子）に変換する
async function resolveName(keyword) {
  // 英語名ならそのまま使える
  const direct = await fetch(`${BASE_URL}/pokemon/${keyword}`)
  if (direct.ok) return keyword

  // 日本語名で species を全件から探す
  const listRes = await fetch(`${BASE_URL}/pokemon-species?limit=2000`)
  if (!listRes.ok) throw new Error('ポケモンが見つかりませんでした')
  const list = await listRes.json()

  for (const entry of list.results) {
    const sRes = await fetch(entry.url)
    if (!sRes.ok) continue
    const s = await sRes.json()
    const ja = pickJa(s.names, 'name')
    if (ja === keyword || ja?.toLowerCase() === keyword) {
      return entry.name
    }
  }
  throw new Error('ポケモンが見つかりませんでした')
}

function pickJa(entries, field) {
  if (!entries) return null
  const hit =
    entries.find((e) => e.language.name === 'ja-Hrkt') ||
    entries.find((e) => e.language.name === 'ja')
  return hit ? hit[field] : null
}

function pickFlavor(entries) {
  if (!entries) return null
  const hit =
    entries.find((e) => e.language.name === 'ja-Hrkt') ||
    entries.find((e) => e.language.name === 'ja')
  return hit ? hit.flavor_text.replace(/[\n\f\r]/g, '') : null
}

const TYPE_JA = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
  grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
  ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
  steel: 'はがね', fairy: 'フェアリー',
}

function translateType(name) {
  return { name, ja: TYPE_JA[name] ?? name }
}

const STAT_JA = {
  hp: 'HP', attack: 'こうげき', defense: 'ぼうぎょ',
  'special-attack': 'とくこう', 'special-defense': 'とくぼう', speed: 'すばやさ',
}

function translateStat(name) {
  return STAT_JA[name] ?? name
}
