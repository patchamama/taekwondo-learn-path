import { useEffect, useMemo, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { CARDS_WITH_CLIPS, CLIPS_BY_CARD, FRAMES_PER_CLIP, clipKey } from '../../data/clips'
import { MaximizeOverlay } from '../../shared/components/Maximize'
import { useT } from '../../shared/i18n/useT'
import { formatTime } from '../audio/timeline'
import {
  epubImageUrl,
  frameUrl,
  importEpubImage,
  listEpub,
  listVideos,
  saveFrame,
  searchVideos,
  videoDuration,
  type EpubItem,
  type IndexHit,
  type PickedImage,
  type VideoInfo,
} from './api'

type Tab = 'clips' | 'books' | 'videos'

const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Frames of the clips already in the app, grouped by the technique they belong to. */
function ClipsTab({ onPick }: { onPick: (i: PickedImage) => void }) {
  const { t, loc } = useT()
  const [q, setQ] = useState('')
  const cards = useMemo(() => {
    const needle = norm(q)
    return CARDS_WITH_CLIPS.map((id) => CARD_BY_ID[id]).filter(
      (c) =>
        c &&
        (!needle ||
          norm(
            `${c.id} ${c.ko} ${c.hangul} ${c.meaning.en} ${c.meaning.de} ${c.meaning.es}`,
          ).includes(needle)),
    )
  }, [q])
  return (
    <div className="grid gap-3">
      <input
        type="search"
        aria-label={t('pickSearch')}
        placeholder={t('pickSearch')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="rounded border px-3 py-1.5"
      />
      {cards.slice(0, 40).map((c) => (
        <section
          key={c.id}
          role="group"
          aria-label={c.ko}
          className="rounded-xl border bg-white p-3"
        >
          <h3 className="mb-2 font-semibold">
            {c.ko} <span className="font-normal text-slate-500">· {loc(c.meaning)}</span>
          </h3>
          {CLIPS_BY_CARD[c.id].map((clip, k) => (
            <div key={k} className="mb-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {Array.from({ length: FRAMES_PER_CLIP }, (_, n) => {
                const path = `frames/${clipKey(clip)}/${encodeURIComponent(clip.cardId)}/${n + 1}.jpg`
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${c.ko} ${clip.label ?? clip.source} ${n + 1}`}
                    onClick={() =>
                      onPick({ src: path, source: `${clip.label ?? clip.source}, frame ${n + 1}` })
                    }
                    className="overflow-hidden rounded border hover:ring-2 hover:ring-sky-500"
                  >
                    <img
                      src={import.meta.env.BASE_URL + path}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

/** Images extracted from the EPUB books that are not part of the project yet. */
function BooksTab({ onPick }: { onPick: (i: PickedImage) => void }) {
  const { t } = useT()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<EpubItem[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const timer = setTimeout(() => {
      listEpub(q, 0)
        .then((r) => alive && (setItems(r.items), setTotal(r.total), setError('')))
        .catch((e: Error) => alive && setError(e.message))
    }, 250)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [q])

  const more = () => listEpub(q, items.length).then((r) => setItems((cur) => [...cur, ...r.items]))
  const choose = (i: EpubItem) =>
    importEpubImage(i.book, i.name)
      .then((r) => onPick({ src: r.src, source: r.source }))
      .catch((e: Error) => setError(e.message))

  return (
    <div className="grid gap-3">
      <input
        type="search"
        aria-label={t('pickSearch')}
        placeholder={t('pickSearch')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="rounded border px-3 py-1.5"
      />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((i) => (
          <button
            key={`${i.book}-${i.name}`}
            type="button"
            aria-label={`${i.bookTitle} ${i.name}`}
            title={`${i.bookTitle}\n${i.name}`}
            onClick={() => choose(i)}
            className="overflow-hidden rounded border bg-white hover:ring-2 hover:ring-sky-500"
          >
            <img
              src={epubImageUrl(i.book, i.name)}
              alt=""
              loading="lazy"
              className="aspect-square w-full object-contain"
            />
          </button>
        ))}
      </div>
      {items.length < total && (
        <button type="button" className="w-fit rounded border px-3 py-1" onClick={more}>
          {t('pickMore')} ({items.length}/{total})
        </button>
      )}
    </div>
  )
}

const STEPS = [-10, -5, -3, 3, 5, 10]

/** Local videos: search the index and subtitles, move frame by frame in seconds, capture the frame you like. */
function VideosTab({ onPick }: { onPick: (i: PickedImage) => void }) {
  const { t } = useT()
  const [videos, setVideos] = useState<VideoInfo[]>([])
  const [video, setVideo] = useState<VideoInfo | null>(null)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<IndexHit[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listVideos()
      .then(setVideos)
      .catch((e: Error) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!video?.local) return
    videoDuration(video.id)
      .then((r) => setDuration(r.duration))
      .catch(() => setDuration(0))
  }, [video])

  useEffect(() => {
    if (!q.trim()) return
    let alive = true
    const timer = setTimeout(() => {
      searchVideos(q)
        .then((r) => alive && setHits(r))
        .catch(() => alive && setHits([]))
    }, 250)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [q])

  const select = (v: VideoInfo, at = 0) => {
    setVideo(v)
    setTime(at)
  }
  const move = (delta: number) =>
    setTime((cur) => Math.max(0, Math.min(duration || Infinity, cur + delta)))
  const capture = () =>
    video &&
    saveFrame(video.id, time)
      .then((r) => onPick({ src: r.src, source: r.source }))
      .catch((e: Error) => setError(e.message))

  return (
    <div className="grid gap-3">
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {videos.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={video?.id === v.id}
            onClick={() => select(v)}
            className={`rounded-full border px-3 py-0.5 text-xs ${video?.id === v.id ? 'bg-slate-900 text-white' : 'bg-white'} ${v.local ? '' : 'opacity-60'}`}
          >
            {v.label}
            {v.local ? '' : ' ✕'}
          </button>
        ))}
      </div>

      <input
        type="search"
        aria-label={t('pickSearchIndex')}
        placeholder={t('pickSearchIndex')}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          if (!e.target.value.trim()) setHits([])
        }}
        className="rounded border px-3 py-1.5"
      />
      {hits.length > 0 && (
        <ul className="grid max-h-40 gap-1 overflow-y-auto rounded border bg-white p-1 text-sm">
          {hits.map((h, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full rounded px-2 py-0.5 text-left hover:bg-slate-100"
                onClick={() => {
                  const v = videos.find((x) => x.id === h.videoId)
                  if (v) select(v, h.t)
                }}
              >
                <span className="font-mono text-xs text-slate-500">{formatTime(h.t)}</span> {h.text}
              </button>
            </li>
          ))}
        </ul>
      )}

      {video && !video.local && <p className="text-sm text-amber-700">{t('pickNoLocal')}</p>}
      {video?.local && (
        <div className="grid gap-2">
          <img
            src={frameUrl(video.id, time)}
            alt={`Frame at ${formatTime(time)}`}
            className="mx-auto max-h-80 w-full rounded-lg bg-black object-contain"
          />
          <input
            type="range"
            aria-label="Position"
            min={0}
            max={Math.max(1, Math.round(duration))}
            step={1}
            value={Math.round(time)}
            onChange={(e) => setTime(Number(e.target.value))}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {STEPS.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded border px-2 py-0.5 text-sm"
                onClick={() => move(s)}
              >
                {s < 0 ? '−' : '+'}
                {Math.abs(s)} s
              </button>
            ))}
            <span className="ml-auto font-mono text-sm">{formatTime(time)}</span>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white"
              onClick={capture}
            >
              {t('pickUseFrame')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Modal to choose an image for a card from the clips, the EPUB books or the local videos. */
export function ImagePicker({
  onPick,
  onClose,
}: {
  onPick: (i: PickedImage) => void
  onClose: () => void
}) {
  const { t } = useT()
  const [tab, setTab] = useState<Tab>('clips')
  const tabs: { id: Tab; label: string }[] = [
    { id: 'clips', label: t('pickClips') },
    { id: 'books', label: t('pickBooks') },
    { id: 'videos', label: t('pickVideos') },
  ]
  return (
    <MaximizeOverlay onClose={onClose}>
      <div className="grid gap-3">
        <h2 className="text-lg font-bold">{t('pickTitle')}</h2>
        <div role="tablist" className="flex gap-1.5">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`rounded-full border px-3 py-0.5 text-sm ${tab === x.id ? 'bg-slate-900 text-white' : 'bg-white'}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        {tab === 'clips' && <ClipsTab onPick={onPick} />}
        {tab === 'books' && <BooksTab onPick={onPick} />}
        {tab === 'videos' && <VideosTab onPick={onPick} />}
      </div>
    </MaximizeOverlay>
  )
}
