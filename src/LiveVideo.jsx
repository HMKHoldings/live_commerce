import { assetPath } from "./assetPath";
import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import "./live-video.css";

const clips = {
  1: "fashion-presenter",
  2: "seated-serum-review",
  3: "shirt-product-presenter",
  4: "seated-makeup-demo",
  5: "seated-cosmetics-review",
};

export default function LiveVideo({ product, Platform, onOpen }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);
  const [failed, setFailed] = useState(false);
  const clip = clips[product.id];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setLoaded(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const sync = () => {
      if (visible && enabled && !document.hidden) {
        video.play().catch(() => setPlaying(false));
      } else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [visible, enabled, loaded]);

  useEffect(() => {
    const silenceOthers = (event) => {
      if (event.detail !== product.id) setMuted(true);
    };
    window.addEventListener("live-video-audio", silenceOthers);
    return () => window.removeEventListener("live-video-audio", silenceOthers);
  }, [product.id]);

  const togglePlayback = () => {
    if (playing) {
      setEnabled(false);
      videoRef.current.pause();
    } else {
      setEnabled(true);
      setFailed(false);
      if (videoRef.current.error) videoRef.current.load();
      videoRef.current.play().catch(() => setPlaying(false));
    }
  };

  return (
    <div className="product-image live-video-frame">
      <video
        ref={videoRef}
        src={loaded ? (product.videoUrl || assetPath(`/videos/${clip}.mp4`)) : undefined}
        poster={product.poster || assetPath(`/videos/${clip}.jpg`)}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={`${product.name} 소개 샘플 영상`}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
        onLoadedData={() => {
          const video = videoRef.current;
          setHasAudio(
            Boolean(
              video.mozHasAudio ||
              video.webkitAudioDecodedByteCount ||
              video.audioTracks?.length,
            ),
          );
        }}
      />
      <button
        className="live-video-open"
        onClick={onOpen}
        aria-label={`${product.name} 자세히 보기`}
      />
      <Platform name={product.platform} />
      <span className="live-video-sample">샘플 영상</span>
      <span className="views">
        <Play size={12} fill="white" />
        {product.views} 시청
      </span>
      <div className="live-video-controls">
        {hasAudio && (
          <button
            type="button"
            aria-label={muted ? "소리 켜기" : "소리 끄기"}
            onClick={() => {
              if (muted)
                window.dispatchEvent(
                  new CustomEvent("live-video-audio", { detail: product.id }),
                );
              setMuted(!muted);
            }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? "영상 일시 정지" : "영상 재생"}
          title={playing ? "일시 정지" : "재생"}
        >
          {playing ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
      </div>
      {failed && (
        <span className="live-video-error" role="status">
          영상을 불러오지 못했어요. 재생 버튼으로 다시 시도하세요.
        </span>
      )}
    </div>
  );
}
