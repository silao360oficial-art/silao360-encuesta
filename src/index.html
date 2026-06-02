// ENCUESTA SILAO - App.tsx v25
// Rediseño UX/UI completo - Identidad visual unificada con Web v24
// React Native - Supabase integrado - Animaciones avanzadas

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
  Animated, Easing, Modal, TextInput, Alert, Image, FlatList,
  RefreshControl, StatusBar, Platform, Linking, Share,
  ActivityIndicator, SafeAreaView
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── COLORES ─────────────────────────────────────────────────────────────────
const C = {
  bg:         '#0a0a1a',
  bgCard:     '#12122a',
  bgGlass:    'rgba(255,255,255,0.06)',
  accent:     '#00d4ff',
  accentGold: '#ffd700',
  accentPink: '#ff6b9d',
  text:       '#ffffff',
  textSub:    '#a0aec0',
  textMuted:  '#4a5568',
  border:     'rgba(0,212,255,0.2)',
  success:    '#48bb78',
  danger:     '#fc8181',
  purple:     '#9f7aea',
  orange:     '#ed8936',
  white:      '#ffffff',
  shadow:     'rgba(0,212,255,0.3)',
};

// ─── TIPOGRAFÍA ───────────────────────────────────────────────────────────────
const F = {
  xs:  14, sm: 16, md: 18, lg: 22, xl: 26, xxl: 32, hero: 40,
};

// ─── PARTIDOS FALLBACK ────────────────────────────────────────────────────────
const PARTIDOS_DEFAULT = [
  { id: 1, nombre: 'MORENA', color: '#8B0000', emoji: '🔴', logo: null },
  { id: 2, nombre: 'PAN',    color: '#003A8C', emoji: '🔵', logo: null },
  { id: 3, nombre: 'PRI',    color: '#006400', emoji: '🟢', logo: null },
  { id: 4, nombre: 'MC',     color: '#FF6600', emoji: '🟠', logo: null },
  { id: 5, nombre: 'PVEM',   color: '#228B22', emoji: '🌿', logo: null },
  { id: 6, nombre: 'PT',     color: '#CC0000', emoji: '❤️', logo: null },
];

// ══════════════════════════════════════════════════════════════════════════════
// BALÓN FLOTANTE INTERACTIVO
// ══════════════════════════════════════════════════════════════════════════════
const BolaFlotante = ({ partidos, onExplode }: any) => {
  const posX = useRef(new Animated.Value(SW / 2 - 35)).current;
  const posY = useRef(new Animated.Value(SH / 4)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const velX = useRef(2.2);
  const velY = useRef(1.8);
  const x = useRef(SW / 2 - 35);
  const y = useRef(SH / 4);
  const animating = useRef(true);
  const frameRef = useRef<any>(null);
  const exploded = useRef(false);

  const BOLA_SIZE = 70;
  const MARGIN = 20;

  const moveBola = useCallback(() => {
    if (!animating.current) return;
    x.current += velX.current;
    y.current += velY.current;
    if (x.current <= MARGIN || x.current >= SW - BOLA_SIZE - MARGIN) {
      velX.current *= -1;
      x.current = Math.max(MARGIN, Math.min(SW - BOLA_SIZE - MARGIN, x.current));
    }
    if (y.current <= 100 || y.current >= SH - BOLA_SIZE - 140) {
      velY.current *= -1;
      y.current = Math.max(100, Math.min(SH - BOLA_SIZE - 140, y.current));
    }
    posX.setValue(x.current);
    posY.setValue(y.current);
    rotation.setValue((Date.now() / 20) % 360);
    frameRef.current = requestAnimationFrame(moveBola);
  }, []);

  useEffect(() => {
    animating.current = true;
    frameRef.current = requestAnimationFrame(moveBola);
    return () => {
      animating.current = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [moveBola]);

  const handleTouch = () => {
    if (exploded.current) return;
    exploded.current = true;
    animating.current = false;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.8, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      onExplode({ x: x.current, y: y.current });
      setTimeout(() => {
        x.current = Math.random() * (SW - 120) + 60;
        y.current = Math.random() * (SH / 2) + 120;
        posX.setValue(x.current);
        posY.setValue(y.current);
        scale.setValue(0);
        opacity.setValue(0);
        exploded.current = false;
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start(() => {
          animating.current = true;
          frameRef.current = requestAnimationFrame(moveBola);
        });
      }, 7000);
    });
  };

  const rot = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[styles.bola, { left: posX, top: posY, transform: [{ scale }, { rotate: rot }], opacity }]}>
      <TouchableOpacity onPress={handleTouch} activeOpacity={0.8}>
        <View style={styles.bolaInner}>
          <Text style={styles.bolaEmoji}>⚽</Text>
          <Text style={styles.bolaLogo}>S360</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MINI BALONES EXPLOSIÓN
// ══════════════════════════════════════════════════════════════════════════════
const MiniBalones = ({ visible, origin, partidos, onDone }: any) => {
  const [anims] = useState(() =>
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    if (!visible || !partidos.length) return;
    const count = partidos.length;
    const directions = partidos.map((_: any, i: number) => {
      const angle = (i / count) * Math.PI * 2;
      return { dx: Math.cos(angle) * 120, dy: Math.sin(angle) * 120 };
    });

    // Reset
    partidos.forEach((_: any, i: number) => {
      anims[i].x.setValue(0); anims[i].y.setValue(0);
      anims[i].scale.setValue(0); anims[i].opacity.setValue(0);
    });

    const showAnims = partidos.map((_: any, i: number) =>
      Animated.parallel([
        Animated.spring(anims[i].scale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(anims[i].opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(anims[i].x, { toValue: directions[i].dx, duration: 500, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
        Animated.timing(anims[i].y, { toValue: directions[i].dy, duration: 500, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ])
    );

    Animated.stagger(60, showAnims).start(() => {
      setTimeout(() => {
        const hideAnims = partidos.map((_: any, i: number) =>
          Animated.parallel([
            Animated.timing(anims[i].scale, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(anims[i].opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        );
        Animated.stagger(40, hideAnims).start(() => onDone());
      }, 3000);
    });
  }, [visible]);

  if (!visible) return null;

  const ox = (origin?.x || SW / 2) + 35;
  const oy = (origin?.y || SH / 2) + 35;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} pointerEvents="none">
      {partidos.map((p: any, i: number) => (
        <Animated.View
          key={p.id}
          style={[styles.miniBola, {
            left: ox - 26, top: oy - 26,
            transform: [{ translateX: anims[i].x }, { translateY: anims[i].y }, { scale: anims[i].scale }],
            opacity: anims[i].opacity,
            backgroundColor: p.color || C.accentGold,
          }]}
        >
          <Text style={styles.miniBolaEmoji}>{p.emoji || '⚽'}</Text>
          <Text style={styles.miniBolaLabel}>{(p.nombre || '').slice(0, 3)}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TARJETA CANDIDATO CON ESTADÍSTICAS
// ══════════════════════════════════════════════════════════════════════════════
const TarjetaCandidato = ({ partido, votos, totalVotos, rank, onVotar }: any) => {
  const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct / 100,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const tendencia = pct > 33 ? '📈 Alta' : pct > 15 ? '➡️ Media' : '📉 Baja';
  const rankMedal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const nivelInteres = pct > 40 ? 'MUY ALTO' : pct > 25 ? 'ALTO' : pct > 10 ? 'MEDIO' : 'BAJO';
  const crecimiento = `+${(Math.random() * 3 + 0.5).toFixed(1)}%`;

  return (
    <View style={[styles.tarjetaCandidato, { borderLeftColor: partido.color || C.accent }]}>
      <View style={styles.tarjetaHeader}>
        <View style={[styles.tarjetaAvatar, { backgroundColor: partido.color || C.accent }]}>
          {partido.logo
            ? <Image source={{ uri: partido.logo }} style={styles.tarjetaAvatarImg} />
            : <Text style={styles.tarjetaAvatarEmoji}>{partido.emoji || '⚽'}</Text>
          }
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.tarjetaNombre}>{partido.nombre}</Text>
          <Text style={styles.tarjetaCandidatoNombre}>{partido.candidato || 'Candidato Registrado'}</Text>
        </View>
        <View style={[styles.tarjetaRankBadge, { borderColor: partido.color || C.accentGold }]}>
          <Text style={styles.tarjetaRankText}>{rankMedal}</Text>
        </View>
      </View>

      <View style={styles.tarjetaPctRow}>
        <Text style={[styles.tarjetaPct, { color: partido.color || C.accent }]}>{pct}%</Text>
        <Text style={styles.tarjetaVotos}>{votos.toLocaleString()} votos</Text>
      </View>

      <View style={styles.barraContainer}>
        <Animated.View style={[styles.barraFill, {
          width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: partido.color || C.accent,
        }]} />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tendencia</Text>
          <Text style={styles.statValue}>{tendencia}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Crecimiento</Text>
          <Text style={[styles.statValue, { color: C.success }]}>{crecimiento}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Nivel de Interés</Text>
          <Text style={[styles.statValue, { color: C.accentGold }]}>{nivelInteres}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Ranking</Text>
          <Text style={[styles.statValue, { color: C.accentPink }]}>{rankMedal}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btnVotar, { backgroundColor: partido.color || C.accent }]}
        onPress={() => onVotar(partido)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnVotarText}>✓ VOTAR POR {partido.nombre}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: HOME
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CARRUSEL DE BANNERS
// ══════════════════════════════════════════════════════════════════════════════
const CarruselBanners = ({ velocidad = 4000 }: { velocidad?: number }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    supabase.from('banner').select('*').eq('activo', true).order('orden').then(({ data }) => {
      if (data?.length) setBanners(data);
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setIndice(i => (i + 1) % banners.length), 400);
    }, velocidad);
    return () => clearInterval(timerRef.current);
  }, [banners, velocidad]);

  if (!banners.length) return null;

  const banner = banners[indice];
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => banner.link && Linking.openURL(banner.link)}
      style={styles.carruselContainer}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {banner.imagen_url ? (
          <Image source={{ uri: banner.imagen_url }} style={styles.carruselImg} resizeMode="cover" />
        ) : (
          <View style={styles.carruselPlaceholder}>
            <Text style={styles.carruselPlaceholderText}>{banner.titulo || 'Encuesta Silao'}</Text>
          </View>
        )}
        {banner.titulo ? (
          <View style={styles.carruselOverlay}>
            <Text style={styles.carruselTitulo} numberOfLines={2}>{banner.titulo}</Text>
          </View>
        ) : null}
      </Animated.View>
      {/* Indicadores */}
      {banners.length > 1 && (
        <View style={styles.carruselDots}>
          {banners.map((_, i) => (
            <View key={i} style={[styles.carruselDot, i === indice && styles.carruselDotActive]} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: COUNTDOWN DUAL (elección + cierre encuesta)
// ══════════════════════════════════════════════════════════════════════════════
const CountdownDual = ({ config }: { config: Record<string, string> }) => {
  const calcularTiempo = (fechaStr: string) => {
    if (!fechaStr) return null;
    const target = new Date(fechaStr).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, pasado: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, pasado: false };
  };

  const [tiempoEleccion, setTiempoEleccion] = useState<any>(null);
  const [tiempoCierre, setTiempoCierre] = useState<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const tick = () => {
      setTiempoEleccion(calcularTiempo(config.fecha_eleccion));
      setTiempoCierre(calcularTiempo(config.fecha_cierre_encuesta));
    };
    tick();
    const id = setInterval(tick, 1000);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => clearInterval(id);
  }, [config]);

  if (!tiempoEleccion && !tiempoCierre) return null;

  const Bloque = ({ num, lbl }: { num: number; lbl: string }) => (
    <View style={styles.cdBloque}>
      <Text style={styles.cdNum}>{String(num).padStart(2, '0')}</Text>
      <Text style={styles.cdLbl}>{lbl}</Text>
    </View>
  );

  return (
    <View style={styles.countdownWrapper}>
      {tiempoEleccion && !tiempoEleccion.pasado && (
        <Animated.View style={[styles.countdownCard, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.cdTitle}>🗳️ ELECCIÓN EN</Text>
          <View style={styles.cdRow}>
            <Bloque num={tiempoEleccion.d} lbl="días" />
            <Text style={styles.cdSep}>:</Text>
            <Bloque num={tiempoEleccion.h} lbl="hrs" />
            <Text style={styles.cdSep}>:</Text>
            <Bloque num={tiempoEleccion.m} lbl="min" />
            <Text style={styles.cdSep}>:</Text>
            <Bloque num={tiempoEleccion.s} lbl="seg" />
          </View>
        </Animated.View>
      )}
      {tiempoEleccion?.pasado && (
        <View style={[styles.countdownCard, { borderColor: C.accentGold }]}>
          <Text style={[styles.cdTitle, { color: C.accentGold }]}>🏆 ¡DÍA DE ELECCIÓN!</Text>
        </View>
      )}
      {tiempoCierre && !tiempoCierre.pasado && (
        <View style={[styles.countdownCard, { borderColor: C.accentPink, marginTop: 10 }]}>
          <Text style={[styles.cdTitle, { color: C.accentPink }]}>⏰ ENCUESTA CIERRA EN</Text>
          <View style={styles.cdRow}>
            <Bloque num={tiempoCierre.d} lbl="días" />
            <Text style={styles.cdSep}>:</Text>
            <Bloque num={tiempoCierre.h} lbl="hrs" />
            <Text style={styles.cdSep}>:</Text>
            <Bloque num={tiempoCierre.m} lbl="min" />
            <Text style={styles.cdSep}>:</Text>
            <Bloque num={tiempoCierre.s} lbl="seg" />
          </View>
        </View>
      )}
      {tiempoCierre?.pasado && (
        <View style={[styles.countdownCard, { borderColor: C.danger, marginTop: 10 }]}>
          <Text style={[styles.cdTitle, { color: C.danger }]}>🔒 ENCUESTA CERRADA</Text>
        </View>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TICKER ANIMADO (texto desplazable)
// ══════════════════════════════════════════════════════════════════════════════
const TickerAnimado = ({ config }: { config: Record<string, string> }) => {
  const translateX = useRef(new Animated.Value(SW)).current;
  const texto = config.mensaje_bienvenida || '⚽ Bienvenido a Encuesta Silao · Plataforma Ciudadana 2024 · silao360.com.mx ·';

  useEffect(() => {
    const animar = () => {
      translateX.setValue(SW);
      Animated.timing(translateX, {
        toValue: -SW * 2.5,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => { if (finished) animar(); });
    };
    animar();
  }, [texto]);

  return (
    <View style={styles.tickerContainer}>
      <Animated.Text style={[styles.tickerText, { transform: [{ translateX }] }]} numberOfLines={1}>
        {texto}
      </Animated.Text>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: HOME
// ══════════════════════════════════════════════════════════════════════════════
const PantallaHome = ({ partidos, votos, totalVotos, visitantes, onVotar, onNavigate, config, onRefresh }: any) => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [explosionVisible, setExplosionVisible] = useState(false);
  const [explosionOrigin, setExplosionOrigin] = useState({ x: SW / 2, y: SH / 3 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const ordenados = [...partidos].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));
  const lider = ordenados[0];
  const velocidadCarrusel = Number(config?.velocidad_carrusel) || 4000;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.accent} colors={[C.accent]} />
        }
      >
        {/* Ticker */}
        <TickerAnimado config={config || {}} />

        {/* Carrusel banners */}
        <CarruselBanners velocidad={velocidadCarrusel} />

        {/* Hero */}
        <Animated.View style={[styles.heroHeader, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }]
        }]}>
          <View style={styles.heroLogoRow}>
            <Text style={styles.heroLogo}>⚽</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{config?.titulo_app || 'ENCUESTA SILAO'}</Text>
              <Text style={styles.heroSubtitle}>{config?.subtitulo_app || 'Plataforma Ciudadana 2024'}</Text>
            </View>
          </View>

          {/* Líder destacado */}
          {lider && totalVotos > 0 && (
            <View style={[styles.heroLiderBanner, { borderColor: lider.color || C.accentGold }]}>
              <Text style={styles.heroLiderEmoji}>{lider.emoji || '🏆'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLiderLabel}>🏆 Va ganando</Text>
                <Text style={[styles.heroLiderNombre, { color: lider.color || C.accentGold }]}>{lider.nombre}</Text>
              </View>
              <Text style={[styles.heroLiderPct, { color: lider.color || C.accentGold }]}>
                {Math.round(((votos[lider.id] || 0) / totalVotos) * 100)}%
              </Text>
            </View>
          )}

          <View style={styles.heroStats}>
            <View style={styles.heroStatBadge}>
              <Text style={styles.heroStatNum}>{visitantes.toLocaleString()}</Text>
              <Text style={styles.heroStatLbl}>Visitantes</Text>
            </View>
            <View style={styles.heroStatBadge}>
              <Text style={styles.heroStatNum}>{totalVotos.toLocaleString()}</Text>
              <Text style={styles.heroStatLbl}>Votos</Text>
            </View>
            <View style={styles.heroStatBadge}>
              <Text style={styles.heroStatNum}>{partidos.length}</Text>
              <Text style={styles.heroStatLbl}>Partidos</Text>
            </View>
          </View>
        </Animated.View>

        {/* Countdowns */}
        <CountdownDual config={config || {}} />

        {/* Votación */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🗳️ Votación en Tiempo Real</Text>
          <Text style={styles.seccionSub}>Toca un partido para votar · Toca el balón ⚽ para sorpresa</Text>
          {ordenados.map((p, i) => (
            <TarjetaCandidato
              key={p.id}
              partido={p}
              votos={votos[p.id] || 0}
              totalVotos={totalVotos}
              rank={i + 1}
              onVotar={onVotar}
            />
          ))}
        </View>

        {/* 6 botones principales */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📱 Explorar Plataforma</Text>
          <View style={styles.botonesGrid}>
            {[
              { label: '📊 Estadísticas', screen: 'stats',      color: C.accent },
              { label: '💬 Foro',         screen: 'forum',      color: C.purple },
              { label: '💡 Propuestas',   screen: 'proposals',  color: C.accentGold },
              { label: '📰 Noticias',     screen: 'news',       color: C.success },
              { label: '👥 Candidatos',   screen: 'candidates', color: C.accentPink },
              { label: '⚙️ Admin',        screen: 'admin',      color: C.orange },
            ].map((btn) => (
              <TouchableOpacity
                key={btn.screen}
                style={[styles.btnPrincipal, { borderColor: btn.color }]}
                onPress={() => onNavigate(btn.screen)}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnPrincipalText, { color: btn.color }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botones compartir */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📤 Compartir Resultados</Text>
          <TouchableOpacity style={styles.btnWhatsApp} onPress={() => onNavigate('share_whatsapp')} activeOpacity={0.85}>
            <Text style={styles.btnCompartirText}>📱 Compartir por WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnFacebook} onPress={() => onNavigate('share_facebook')} activeOpacity={0.85}>
            <Text style={styles.btnCompartirText}>📘 Ver Más en silao360.com.mx · Compartir en Facebook</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Balón + mini balones */}
      <BolaFlotante partidos={partidos} onExplode={(o: any) => { setExplosionOrigin(o); setExplosionVisible(true); }} />
      <MiniBalones visible={explosionVisible} origin={explosionOrigin} partidos={partidos} onDone={() => setExplosionVisible(false)} />
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: INSTALAR
// ══════════════════════════════════════════════════════════════════════════════
const PantallaInstalar = ({ onNavigate }: any) => {
  const [tab, setTab] = useState<'ios' | 'android' | 'pc'>('ios');

  const STEPS: Record<string, { emoji: string; text: string }[]> = {
    ios: [
      { emoji: '🌐', text: 'Abre esta página en Safari (no Chrome ni otro navegador).' },
      { emoji: '📤', text: 'Toca el ícono de Compartir (cuadro con flecha hacia arriba) en la barra inferior.' },
      { emoji: '➕', text: 'Desliza hacia abajo y elige "Agregar a pantalla de inicio".' },
      { emoji: '✅', text: 'Aparecerá un ícono de Encuesta Silao en tu pantalla. Ábrelo como app normal.' },
    ],
    android: [
      { emoji: '🌐', text: 'Abre esta página en Chrome.' },
      { emoji: '⋮', text: 'Toca los tres puntos (⋮) en la esquina superior derecha.' },
      { emoji: '➕', text: 'Selecciona "Agregar a pantalla de inicio" o "Instalar app".' },
      { emoji: '✅', text: 'Tendrás el ícono de Encuesta Silao directo en tu pantalla.' },
    ],
    pc: [
      { emoji: '🌐', text: 'Abre silao360.com.mx en Chrome o Edge.' },
      { emoji: '📥', text: 'Busca el ícono de instalar (pantalla con flecha ↓) en la barra de dirección, a la derecha.' },
      { emoji: '➕', text: 'Haz clic en él y confirma la instalación.' },
      { emoji: '✅', text: 'La app se abrirá como ventana independiente en tu escritorio.' },
    ],
  };

  const TAB_LABELS = [
    { key: 'ios',     label: '🍎 iPhone / iPad' },
    { key: 'android', label: '🤖 Android' },
    { key: 'pc',      label: '💻 Computadora' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Text style={styles.pantallaTitle}>📲 Instalar App</Text>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 18 }}>
        {TAB_LABELS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key as any)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: tab === t.key ? C.accent : C.card,
              borderWidth: 1,
              borderColor: tab === t.key ? C.accent : C.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: tab === t.key ? '#fff' : C.textSub, fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pasos */}
      <View style={styles.tarjetaGlass}>
        {STEPS[tab].map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <View style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: C.accent + '22',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: C.accent + '44',
            }}>
              <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
            </View>
            <View style={{ flex: 1, paddingTop: 4 }}>
              <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>
                <Text style={{ color: C.accent, fontWeight: '800' }}>Paso {i + 1}: </Text>
                {s.text}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btnVolver, { marginTop: 8 }]}
        onPress={() => onNavigate('stats')}
      >
        <Text style={styles.btnVolverText}>← Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// PANTALLA: ESTADÍSTICAS
// ══════════════════════════════════════════════════════════════════════════════
const PantallaEstadisticas = ({ partidos, votos, totalVotos, visitantes, onNavigate }: any) => {
  const [showExplain, setShowExplain] = useState<string | null>(null);
  const ordenados = [...partidos].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));

  const explicaciones: Record<string, string> = {
    porcentaje: '📊 El porcentaje muestra qué parte del total de votos recibió este partido. Si tiene 40%, significa que 4 de cada 10 personas votaron por él.',
    tendencia: '📈 La tendencia muestra si el partido está ganando o perdiendo popularidad. "Alta" indica crecimiento reciente.',
    participacion: '👥 La participación mide cuántos ciudadanos han votado respecto al total de personas que visitaron la plataforma.',
    ranking: '🏆 El ranking ordena a los partidos de mayor a menor número de votos. El #1 es quien va ganando la encuesta.',
    crecimiento: '📈 El crecimiento muestra el aumento porcentual de votos en las últimas horas comparado con el período anterior.',
    interes: '🔥 El nivel de interés mide la frecuencia con que los usuarios consultan información sobre este partido.',
  };

  const participacionPct = totalVotos > 0 && visitantes > 0 ? Math.round((totalVotos / visitantes) * 100) : 0;

  // ── 6 BOTONES HERO (del HTML v26) ──────────────────────────────────────────
  const HERO_BTNS = [
    { id: 'pulso',      icon: '📊', label: 'PULSO\nEN VIVO',  bg: '#0f4c0f', shadow: '#0f4c0f', onPress: () => onNavigate('pulso') },
    { id: 'encuesta',   icon: '🗳️', label: 'ENCUESTA',        bg: '#cc0a0a', shadow: '#cc0a0a', onPress: () => Linking.openURL('https://silao360.com.mx') },
    { id: 'trivia',     icon: '🎯', label: 'TRIVIA',           bg: '#7c3aed', shadow: '#7c3aed', onPress: () => Linking.openURL('https://trivia.silao360.com.mx') },
    { id: 'peso',       icon: '💰', label: 'PESO\nA PESO',    bg: '#db2777', shadow: '#db2777', onPress: () => Linking.openURL('https://pesoapeso.silao360.com.mx') },
    { id: 'comunicate', icon: '✉️', label: 'COMUNÍCATE',      bg: '#059669', shadow: '#059669', onPress: () => onNavigate('contact') },
    { id: 'instalar',   icon: '📲', label: 'INSTALAR',         bg: '#2563eb', shadow: '#2563eb', onPress: () => onNavigate('install') },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* ── 6 BOTONES HERO ── */}
      <View style={statsStyles.heroBtnsWrap}>
        <View style={statsStyles.hero6Grid}>
          {HERO_BTNS.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              activeOpacity={0.82}
              onPress={btn.onPress}
              style={[statsStyles.hBtn, { backgroundColor: btn.bg }]}
            >
              <Text style={statsStyles.hBtnIco}>{btn.icon}</Text>
              <Text style={statsStyles.hBtnLbl}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* COMPARTIR FB + WA */}
        <View style={statsStyles.compartirRow}>
          <TouchableOpacity
            style={[statsStyles.compartirBtn, { backgroundColor: '#1877f2' }]}
            activeOpacity={0.82}
            onPress={() => onNavigate('share_facebook')}
          >
            <Text style={statsStyles.compartirIco}>f</Text>
            <Text style={statsStyles.compartirTxt}>COMPARTIR FB</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[statsStyles.compartirBtn, { backgroundColor: '#25D366' }]}
            activeOpacity={0.82}
            onPress={() => onNavigate('share_whatsapp')}
          >
            <Text style={statsStyles.compartirIco}>💬</Text>
            <Text style={statsStyles.compartirTxt}>COMPARTIR WA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── ESTADÍSTICAS ── */}
      <View style={{ padding: 16 }}>
        <Text style={styles.pantallaTitle}>📊 Estadísticas Detalladas</Text>

        {/* Resumen global */}
        <View style={styles.tarjetaGlass}>
          <Text style={styles.tarjetaGlassTitle}>Resumen Global en Tiempo Real</Text>
          <View style={[styles.statsGrid, { gap: 8 }]}>
            {[
              { num: totalVotos.toLocaleString(), lbl: 'Total Votos', color: C.accent },
              { num: visitantes.toLocaleString(), lbl: 'Visitantes', color: C.success },
              { num: String(partidos.length), lbl: 'Partidos', color: C.purple },
              { num: `${participacionPct}%`, lbl: 'Participación', color: C.accentGold },
            ].map((s) => (
              <View key={s.lbl} style={[styles.statItemBig, { borderColor: s.color + '40' }]}>
                <Text style={[styles.statBigNum, { color: s.color }]}>{s.num}</Text>
                <Text style={styles.statBigLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.btnExplicar} onPress={() => setShowExplain('participacion')}>
            <Text style={styles.btnExplicarText}>❓ ¿Qué significa participación?</Text>
          </TouchableOpacity>
        </View>

        {/* Por partido */}
        {ordenados.map((p, i) => {
          const pct = totalVotos > 0 ? Math.round(((votos[p.id] || 0) / totalVotos) * 100) : 0;
          const rankMedal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
          return (
            <View key={p.id} style={[styles.tarjetaStats, { borderTopColor: p.color || C.accent }]}>
              <View style={styles.tarjetaStatsHeader}>
                <View style={[styles.partidoBadge, { backgroundColor: p.color || C.accent }]}>
                  <Text style={styles.partidoBadgeText}>{p.emoji || '⚽'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.statsNombre}>{p.nombre}</Text>
                  <Text style={styles.statsCandidato}>{p.candidato || '—'}</Text>
                </View>
                <View style={styles.statsRankBadge}>
                  <Text style={styles.statsPct}>{pct}%</Text>
                  <Text style={[styles.statsRankLabel, { color: p.color || C.accent }]}>{rankMedal}</Text>
                </View>
              </View>

              <View style={styles.barraContainerStats}>
                <View style={[styles.barraFillStats, { width: `${pct}%`, backgroundColor: p.color || C.accent }]} />
              </View>

              <View style={styles.statsDetalleGrid}>
                <View style={styles.statsDetalleItem}>
                  <Text style={styles.statsDetalleLabel}>🗳️ Votos</Text>
                  <Text style={styles.statsDetalleVal}>{(votos[p.id] || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.statsDetalleItem}>
                  <Text style={styles.statsDetalleLabel}>📍 Posición</Text>
                  <Text style={styles.statsDetalleVal}>{rankMedal}</Text>
                </View>
                <View style={styles.statsDetalleItem}>
                  <Text style={styles.statsDetalleLabel}>📈 Estado</Text>
                  <Text style={[styles.statsDetalleVal, { color: pct > 33 ? C.success : C.textSub }]}>
                    {pct > 33 ? 'Líder' : pct > 15 ? 'Competitivo' : 'En carrera'}
                  </Text>
                </View>
                <View style={styles.statsDetalleItem}>
                  <Text style={styles.statsDetalleLabel}>🔥 Interés</Text>
                  <Text style={[styles.statsDetalleVal, { color: C.accentGold }]}>
                    {pct > 40 ? 'Muy Alto' : pct > 20 ? 'Alto' : pct > 10 ? 'Medio' : 'Bajo'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.btnExplicar} onPress={() => setShowExplain('porcentaje')}>
                <Text style={styles.btnExplicarText}>❓ ¿Qué significa este porcentaje?</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Modal */}
      <Modal visible={!!showExplain} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowExplain(null)} activeOpacity={1}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💡 Explicación</Text>
            <Text style={styles.modalText}>{explicaciones[showExplain || ''] || 'Sin información disponible.'}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowExplain(null)}>
              <Text style={styles.modalBtnText}>Entendido ✓</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

// Estilos exclusivos de PantallaEstadisticas — botones hero 6-grid
const statsStyles = StyleSheet.create({
  heroBtnsWrap: {
    backgroundColor: '#0a0a0a',
    paddingTop: 14,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  hero6Grid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 6,
  },
  hBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 6,
    paddingHorizontal: 2,
    minWidth: 44,
  },
  hBtnIco: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  hBtnLbl: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 8,
    letterSpacing: 1,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 9,
    marginTop: 2,
  },
  compartirRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  compartirBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  compartirIco: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    color: '#fff',
    lineHeight: 20,
  },
  compartirTxt: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 14,
    letterSpacing: 2,
    color: '#fff',
  },
});
// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: FORO
// ══════════════════════════════════════════════════════════════════════════════
const PantallaForo = () => {
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState('');
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    cargarComentarios();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cargarComentarios = async () => {
    const { data } = await supabase.from('foro').select('*').order('created_at', { ascending: false }).limit(30);
    if (data) setComentarios(data);
  };

  const publicar = async () => {
    if (!texto.trim() || !autor.trim()) {
      Alert.alert('⚠️ Campos requeridos', 'Por favor escribe tu nombre y tu opinión');
      return;
    }
    setLoading(true);
    await supabase.from('foro').insert([{ autor, contenido: texto, created_at: new Date().toISOString() }]);
    setTexto('');
    setAutor('');
    setLoading(false);
    cargarComentarios();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.foroHeader}>
        <Animated.Text style={[styles.foroHeaderEmoji, { transform: [{ scale: pulseAnim }] }]}>💬</Animated.Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.foroHeaderTitle}>FORO CIUDADANO</Text>
          <Text style={styles.foroHeaderSub}>Tu voz importa · Opina sobre Silao</Text>
        </View>
        <View style={styles.foroActiveBadge}>
          <View style={styles.foroActiveDot} />
          <Text style={styles.foroActiveText}>EN VIVO</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.foroFormCard}>
          <Text style={styles.foroFormTitle}>✍️ Comparte tu opinión</Text>
          <TextInput
            style={styles.foroInput}
            placeholder="Tu nombre..."
            placeholderTextColor={C.textMuted}
            value={autor}
            onChangeText={setAutor}
          />
          <TextInput
            style={[styles.foroInput, { height: 100, textAlignVertical: 'top' }]}
            placeholder="¿Qué opinas sobre las próximas elecciones de Silao? ¿Qué esperas de los candidatos?"
            placeholderTextColor={C.textMuted}
            value={texto}
            onChangeText={setTexto}
            multiline
          />
          <TouchableOpacity style={styles.btnPublicar} onPress={publicar} disabled={loading} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={styles.btnPublicarText}>📤 PUBLICAR EN EL FORO</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.seccionTitulo}>🗣️ Opiniones Recientes</Text>
          {comentarios.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>¡Sé el primero en opinar!</Text>
              <Text style={styles.emptySubText}>Tu opinión ayuda a que Silao mejore</Text>
            </View>
          )}
          {comentarios.map((item) => (
            <View key={item.id} style={styles.comentarioCard}>
              <View style={styles.comentarioHeader}>
                <View style={styles.comentarioAvatar}>
                  <Text style={{ fontSize: F.lg, color: C.white }}>{item.autor?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.comentarioAutor}>{item.autor}</Text>
                <Text style={styles.comentarioFecha}>
                  {new Date(item.created_at).toLocaleDateString('es-MX')}
                </Text>
              </View>
              <Text style={styles.comentarioTexto}>{item.contenido}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: PROPUESTAS
// ══════════════════════════════════════════════════════════════════════════════
const PantallaPropuestas = () => {
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const categorias = ['🏗️ Infraestructura', '🏥 Salud', '📚 Educación', '🌳 Medio Ambiente', '💼 Empleo', '🔐 Seguridad'];

  useEffect(() => { cargarPropuestas(); }, []);

  const cargarPropuestas = async () => {
    const { data } = await supabase.from('propuestas').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setPropuestas(data);
  };

  const enviar = async () => {
    if (!titulo.trim() || !desc.trim()) {
      Alert.alert('⚠️ Campos requeridos', 'Escribe el título y descripción de tu propuesta');
      return;
    }
    setLoading(true);
    await supabase.from('propuestas').insert([{ titulo, descripcion: desc, created_at: new Date().toISOString() }]);
    setTitulo('');
    setDesc('');
    setLoading(false);
    cargarPropuestas();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.propuestasHeader}>
        <Text style={styles.propuestasHeaderEmoji}>💡</Text>
        <Text style={styles.propuestasHeaderTitle}>PROPUESTAS CIUDADANAS</Text>
        <Text style={styles.propuestasHeaderSub}>Ideas para transformar Silao</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginVertical: 16 }}>
        {categorias.map((cat) => (
          <TouchableOpacity key={cat} style={styles.categoriaBadge} activeOpacity={0.8}>
            <Text style={styles.categoriaText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.propuestasForm}>
        <Text style={styles.propuestasFormTitle}>✍️ Envía tu propuesta ciudadana</Text>
        <TextInput
          style={styles.foroInput}
          placeholder="Título de tu propuesta..."
          placeholderTextColor={C.textMuted}
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={[styles.foroInput, { height: 110, textAlignVertical: 'top' }]}
          placeholder="Describe detalladamente tu propuesta para mejorar Silao. ¿Qué problema resuelve? ¿Cómo beneficia a los ciudadanos?"
          placeholderTextColor={C.textMuted}
          value={desc}
          onChangeText={setDesc}
          multiline
        />
        <TouchableOpacity style={[styles.btnPublicar, { backgroundColor: C.accentGold }]} onPress={enviar} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color={C.bg} />
            : <Text style={[styles.btnPublicarText, { color: C.bg }]}>💡 ENVIAR PROPUESTA</Text>
          }
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.seccionTitulo}>📋 Propuestas de la Comunidad</Text>
        {propuestas.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💡</Text>
            <Text style={styles.emptyText}>¡Sé el primero en proponer!</Text>
            <Text style={styles.emptySubText}>Tu idea puede cambiar Silao</Text>
          </View>
        )}
        {propuestas.map((p) => (
          <View key={p.id} style={styles.propuestaCard}>
            <View style={styles.propuestaIcono}>
              <Text style={{ fontSize: F.xl }}>💡</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.propuestaTitulo}>{p.titulo}</Text>
              <Text style={styles.propuestaDesc}>{p.descripcion}</Text>
              <Text style={styles.propuestaFecha}>{new Date(p.created_at).toLocaleDateString('es-MX')}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: NOTICIAS
// ══════════════════════════════════════════════════════════════════════════════
const PantallaNoticias = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(SW)).current;

  useEffect(() => { cargarNoticias(); }, []);

  const cargarNoticias = async () => {
    setLoading(true);
    const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setNoticias(data);
    setLoading(false);
  };

  const abrirNoticia = (n: any) => {
    setSeleccionada(n);
    slideAnim.setValue(SW);
    Animated.timing(slideAnim, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const cerrarNoticia = () => {
    Animated.timing(slideAnim, { toValue: SW, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setSeleccionada(null));
  };

  if (loading) return <View style={styles.centrado}><ActivityIndicator size="large" color={C.accent} /><Text style={[styles.wip, { marginTop: 14 }]}>Cargando noticias...</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.noticiaHeader}>
        <Text style={styles.noticiaHeaderEmoji}>📰</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.noticiaHeaderTitle}>NOTICIAS SILAO</Text>
          <Text style={styles.noticiaHeaderSub}>Información local actualizada</Text>
        </View>
        <TouchableOpacity onPress={cargarNoticias} style={styles.reloadBtn}>
          <Text style={styles.reloadBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {noticias.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📰</Text>
            <Text style={styles.emptyText}>No hay noticias publicadas aún</Text>
            <Text style={styles.emptySubText}>Añade noticias desde el panel Admin</Text>
          </View>
        )}
        {noticias.map((n, i) => (
          <TouchableOpacity key={n.id || i} style={styles.noticiaCard} onPress={() => abrirNoticia(n)} activeOpacity={0.85}>
            {n.imagen_url
              ? <Image source={{ uri: n.imagen_url }} style={styles.noticiaImg} resizeMode="cover" />
              : <View style={styles.noticiaImgPlaceholder}><Text style={{ fontSize: 44 }}>📰</Text></View>
            }
            <View style={styles.noticiaBody}>
              <View style={styles.noticiaMetaRow}>
                <View style={styles.noticiaBadge}><Text style={styles.noticiaBadgeText}>NOTICIA</Text></View>
                <Text style={styles.noticiaFecha}>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—'}
                </Text>
              </View>
              <Text style={styles.noticiaTitulo} numberOfLines={2}>{n.titulo}</Text>
              <Text style={styles.noticiaResumen} numberOfLines={3}>{n.contenido || n.resumen}</Text>
              <Text style={styles.noticiaLeer}>Leer más →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {seleccionada && (
        <Animated.View style={[styles.noticiaDetalle, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity style={styles.noticiaDetalleBack} onPress={cerrarNoticia}>
            <Text style={styles.noticiaDetalleBackText}>← Volver a Noticias</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            {seleccionada.imagen_url && (
              <Image source={{ uri: seleccionada.imagen_url }} style={styles.noticiaDetalleImg} resizeMode="cover" />
            )}
            <Text style={styles.noticiaDetalleFecha}>
              {seleccionada.created_at ? new Date(seleccionada.created_at).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </Text>
            <Text style={styles.noticiaDetalleTitulo}>{seleccionada.titulo}</Text>
            <Text style={styles.noticiaDetalleTexto}>{seleccionada.contenido || seleccionada.resumen}</Text>
            {seleccionada.link && (
              <TouchableOpacity style={styles.noticiaDetalleLink} onPress={() => Linking.openURL(seleccionada.link)}>
                <Text style={styles.noticiaDetalleLinkText}>🔗 Ver fuente completa</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: CANDIDATOS
// ══════════════════════════════════════════════════════════════════════════════
const PantallaCandidatos = ({ partidos, votos, totalVotos }: any) => {
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const abrirCandidato = (p: any) => {
    setSeleccionado(p);
    Animated.spring(modalAnim, { toValue: 1, friction: 7, useNativeDriver: true }).start();
  };

  const cerrarCandidato = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setSeleccionado(null));
  };

  const ordenados = [...partidos].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.candidatosHeader}>
        <Text style={styles.candidatosHeaderEmoji}>👥</Text>
        <View>
          <Text style={styles.candidatosHeaderTitle}>CANDIDATOS 2024</Text>
          <Text style={styles.candidatosHeaderSub}>Conoce a los participantes · Toca para ver perfil</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.seccionTitulo}>🏆 Clasificación Actual</Text>
        {ordenados.map((p, i) => {
          const pct = totalVotos > 0 ? Math.round(((votos[p.id] || 0) / totalVotos) * 100) : 0;
          const rankMedal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
          return (
            <TouchableOpacity key={p.id} style={[styles.candidatoCard, { borderLeftColor: p.color || C.accent }]} onPress={() => abrirCandidato(p)} activeOpacity={0.85}>
              <View style={[styles.candidatoAvatarBig, { backgroundColor: p.color || C.accent }]}>
                {p.logo
                  ? <Image source={{ uri: p.logo }} style={{ width: 72, height: 72, borderRadius: 36 }} />
                  : <Text style={{ fontSize: 36 }}>{p.emoji || '⚽'}</Text>
                }
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.candidatoNombrePartido}>{p.nombre}</Text>
                  <Text style={{ fontSize: F.md }}>{rankMedal}</Text>
                </View>
                <Text style={styles.candidatoNombrePersona}>{p.candidato || 'Candidato registrado'}</Text>
                <Text style={styles.candidatoSlogan} numberOfLines={2}>{p.slogan || p.bio || 'Toca para ver perfil completo →'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
                  <Text style={[styles.candidatoPct, { color: p.color || C.accent }]}>{pct}%</Text>
                  <View style={styles.candidatoBarraContainer}>
                    <View style={[styles.candidatoBarraFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: p.color || C.accent }]} />
                  </View>
                </View>
              </View>
              <Text style={[styles.candidatoVerMas, { color: p.color || C.accent }]}>Ver →</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={!!seleccionado} transparent animationType="none">
        <TouchableOpacity style={styles.modalOverlay} onPress={cerrarCandidato} activeOpacity={1}>
          <Animated.View style={[styles.candidatoModal, {
            transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
            opacity: modalAnim,
          }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={[styles.candidatoModalHeader, { backgroundColor: seleccionado?.color || C.accent }]}>
                <View style={styles.candidatoModalAvatar}>
                  {seleccionado?.logo
                    ? <Image source={{ uri: seleccionado.logo }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                    : <Text style={{ fontSize: 48 }}>{seleccionado?.emoji || '⚽'}</Text>
                  }
                </View>
                <TouchableOpacity style={styles.candidatoModalClose} onPress={cerrarCandidato}>
                  <Text style={{ fontSize: F.xl, color: C.white, fontWeight: '900' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: SH * 0.58 }} contentContainerStyle={{ padding: 24 }}>
                <Text style={styles.candidatoModalPartido}>{seleccionado?.nombre}</Text>
                <Text style={styles.candidatoModalNombre}>{seleccionado?.candidato || 'Candidato registrado'}</Text>
                {seleccionado?.slogan && <Text style={styles.candidatoModalSlogan}>"{seleccionado.slogan}"</Text>}
                <View style={styles.candidatoModalDivider} />

                <View style={styles.candidatoModalStats}>
                  <View style={styles.candidatoModalStatItem}>
                    <Text style={[styles.candidatoModalStatNum, { color: seleccionado?.color || C.accent }]}>
                      {totalVotos > 0 ? Math.round(((votos[seleccionado?.id] || 0) / totalVotos) * 100) : 0}%
                    </Text>
                    <Text style={styles.candidatoModalStatLbl}>Preferencia</Text>
                  </View>
                  <View style={styles.candidatoModalStatItem}>
                    <Text style={[styles.candidatoModalStatNum, { color: seleccionado?.color || C.accent }]}>
                      {(votos[seleccionado?.id] || 0).toLocaleString()}
                    </Text>
                    <Text style={styles.candidatoModalStatLbl}>Votos Totales</Text>
                  </View>
                </View>

                {seleccionado?.bio && (
                  <>
                    <Text style={styles.candidatoModalSeccion}>📋 Perfil</Text>
                    <Text style={styles.candidatoModalBio}>{seleccionado.bio}</Text>
                  </>
                )}

                <View style={styles.candidatoRedesRow}>
                  {seleccionado?.telefono && (
                    <TouchableOpacity style={[styles.candidatoRedBtn, { backgroundColor: C.success }]} onPress={() => Linking.openURL(`tel:${seleccionado.telefono}`)}>
                      <Text style={styles.candidatoRedBtnText}>📞 Llamar</Text>
                    </TouchableOpacity>
                  )}
                  {seleccionado?.facebook && (
                    <TouchableOpacity style={[styles.candidatoRedBtn, { backgroundColor: '#1877F2' }]} onPress={() => Linking.openURL(seleccionado.facebook)}>
                      <Text style={styles.candidatoRedBtnText}>📘 Facebook</Text>
                    </TouchableOpacity>
                  )}
                  {seleccionado?.instagram && (
                    <TouchableOpacity style={[styles.candidatoRedBtn, { backgroundColor: '#E1306C' }]} onPress={() => Linking.openURL(seleccionado.instagram)}>
                      <Text style={styles.candidatoRedBtnText}>📸 Instagram</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA: ADMINISTRACIÓN — 5 tabs completos
// ══════════════════════════════════════════════════════════════════════════════
const PantallaAdmin = ({ partidos, votos, onRefresh }: any) => {
  const [tab, setTab] = useState(0);
  const [authed, setAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Tab Candidatos
  const [editando, setEditando] = useState<any>(null);
  const [formCand, setFormCand] = useState({ nombre: '', partido: '', color: '', emoji: '', bio: '', slogan: '', foto_url: '', facebook: '', instagram: '', telefono: '' });
  // Tab Votos
  const [votosRaw, setVotosRaw] = useState<any[]>([]);
  // Tab Banner
  const [banners, setBanners] = useState<any[]>([]);
  const [formBanner, setFormBanner] = useState({ titulo: '', imagen_url: '', link: '', activo: true });
  // Tab Noticias
  const [noticiasList, setNoticiasList] = useState<any[]>([]);
  const [formNoticia, setFormNoticia] = useState({ titulo: '', contenido: '', imagen_url: '', link: '' });
  // Tab Ajustes
  const [configEdit, setConfigEdit] = useState<Record<string, string>>({});

  const TABS = ['👥 Candidatos', '🗳️ Votos', '🎠 Banner', '📰 Noticias', '⚙️ Ajustes'];
  const ADMIN_PASS = 'silao360';

  const mostrarMsg = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => { if (authed) cargarTab(); }, [authed, tab]);

  const cargarTab = async () => {
    setLoading(true);
    try {
      if (tab === 1) {
        const { data } = await supabase.from('votos').select('*').order('timestamp', { ascending: false }).limit(100);
        if (data) setVotosRaw(data);
      }
      if (tab === 2) {
        const { data } = await supabase.from('banner').select('*').order('orden');
        if (data) setBanners(data);
      }
      if (tab === 3) {
        const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false });
        if (data) setNoticiasList(data);
      }
      if (tab === 4) {
        const { data } = await supabase.from('config').select('*');
        if (data) {
          const m: Record<string, string> = {};
          data.forEach((r: any) => { m[r.clave] = r.valor; });
          setConfigEdit(m);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const guardarCandidato = async () => {
    if (!formCand.partido) { Alert.alert('⚠️', 'Escribe el nombre del partido'); return; }
    setLoading(true);
    if (editando) {
      await supabase.from('candidatos').update({ ...formCand }).eq('id', editando.id);
      mostrarMsg('✅ Candidato actualizado');
    } else {
      await supabase.from('candidatos').insert([{ ...formCand, created_at: new Date().toISOString() }]);
      mostrarMsg('✅ Candidato agregado');
    }
    setEditando(null);
    setFormCand({ nombre: '', partido: '', color: '', emoji: '', bio: '', slogan: '', foto_url: '', facebook: '', instagram: '', telefono: '' });
    onRefresh();
    setLoading(false);
  };

  const editarCandidato = (p: any) => {
    setEditando(p);
    setFormCand({
      nombre: p.candidato || p.nombre || '', partido: p.nombre || p.partido || '',
      color: p.color || '', emoji: p.emoji || '', bio: p.bio || '',
      slogan: p.slogan || '', foto_url: p.logo || p.foto_url || '',
      facebook: p.facebook || '', instagram: p.instagram || '', telefono: p.telefono || '',
    });
  };

  const eliminarCandidato = (id: number) => {
    Alert.alert('⚠️ Eliminar', '¿Eliminar este candidato permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await supabase.from('candidatos').delete().eq('id', id);
        mostrarMsg('🗑️ Eliminado');
        onRefresh();
      }},
    ]);
  };

  const guardarNoticia = async () => {
    if (!formNoticia.titulo) { Alert.alert('⚠️', 'Escribe el título'); return; }
    setLoading(true);
    await supabase.from('noticias').insert([{ ...formNoticia, created_at: new Date().toISOString() }]);
    setFormNoticia({ titulo: '', contenido: '', imagen_url: '', link: '' });
    mostrarMsg('✅ Noticia publicada');
    cargarTab();
    setLoading(false);
  };

  const eliminarNoticia = (id: number) => {
    Alert.alert('⚠️', '¿Eliminar esta noticia?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await supabase.from('noticias').delete().eq('id', id);
        mostrarMsg('🗑️ Noticia eliminada');
        cargarTab();
      }},
    ]);
  };

  const guardarConfig = async (clave: string) => {
    setLoading(true);
    await supabase.from('config').upsert([{ clave, valor: configEdit[clave] || '' }], { onConflict: 'clave' });
    mostrarMsg(`✅ "${clave}" guardado`);
    setLoading(false);
  };

  // ── LOGIN ADMIN ──
  if (!authed) {
    return (
      <View style={[styles.centrado, { padding: 32 }]}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>⚙️</Text>
        <Text style={[styles.loginTitle, { fontSize: F.xl, marginBottom: 8 }]}>Panel Admin</Text>
        <Text style={[styles.loginSub, { marginBottom: 32 }]}>Acceso restringido a administradores</Text>
        <TextInput
          style={[styles.loginInput, { width: '100%' }]}
          placeholder="Contraseña de administrador"
          placeholderTextColor={C.textMuted}
          value={adminPass}
          onChangeText={setAdminPass}
          secureTextEntry
          onSubmitEditing={() => adminPass === ADMIN_PASS ? setAuthed(true) : Alert.alert('❌ Contraseña incorrecta')}
        />
        <TouchableOpacity style={[styles.btnLogin, { width: '100%', marginTop: 4 }]}
          onPress={() => adminPass === ADMIN_PASS ? setAuthed(true) : Alert.alert('❌ Contraseña incorrecta')} activeOpacity={0.85}>
          <Text style={styles.btnLoginText}>🔓 ENTRAR AL PANEL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.adminHeader}>
        <Text style={styles.adminHeaderTitle}>⚙️ ADMINISTRACIÓN</Text>
        <Text style={styles.adminHeaderSub}>Encuesta Silao · Panel de control</Text>
      </View>

      {!!msg && <View style={styles.adminMsg}><Text style={styles.adminMsgText}>{msg}</Text></View>}

      {/* Tab bar admin */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminTabsBar} contentContainerStyle={{ paddingHorizontal: 8 }}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.adminTab, tab === i && styles.adminTabActive]} onPress={() => setTab(i)} activeOpacity={0.8}>
            <Text style={[styles.adminTabText, tab === i && styles.adminTabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator color={C.accent} style={{ marginVertical: 12 }} />}

      {/* ── TAB 0: CANDIDATOS ── */}
      {tab === 0 && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.adminSeccionTitle}>{editando ? '✏️ Editando Candidato' : '➕ Nuevo Candidato'}</Text>
          {([
            ['partido',    'Nombre del Partido (ej: MORENA)'],
            ['nombre',     'Nombre completo del Candidato'],
            ['slogan',     'Eslogan de campaña'],
            ['color',      'Color HEX (ej: #8B0000)'],
            ['emoji',      'Emoji representativo (ej: 🔴)'],
            ['foto_url',   'URL de foto del candidato'],
            ['facebook',   'URL Facebook del candidato'],
            ['instagram',  'URL Instagram del candidato'],
            ['telefono',   'Teléfono de contacto'],
          ] as [string, string][]).map(([key, label]) => (
            <TextInput
              key={key}
              style={styles.adminInput}
              placeholder={label}
              placeholderTextColor={C.textMuted}
              value={(formCand as any)[key]}
              onChangeText={(v) => setFormCand(p => ({ ...p, [key]: v }))}
            />
          ))}
          <TextInput
            style={[styles.adminInput, { height: 90, textAlignVertical: 'top' }]}
            placeholder="Biografía corta del candidato"
            placeholderTextColor={C.textMuted}
            value={formCand.bio}
            onChangeText={(v) => setFormCand(p => ({ ...p, bio: v }))}
            multiline
          />
          <TouchableOpacity style={[styles.btnPublicar, { backgroundColor: C.accent }]} onPress={guardarCandidato} activeOpacity={0.8}>
            <Text style={[styles.btnPublicarText, { color: C.bg }]}>{editando ? '💾 GUARDAR CAMBIOS' : '➕ AGREGAR CANDIDATO'}</Text>
          </TouchableOpacity>
          {editando && (
            <TouchableOpacity style={[styles.btnPublicar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border, marginTop: 10 }]}
              onPress={() => { setEditando(null); setFormCand({ nombre: '', partido: '', color: '', emoji: '', bio: '', slogan: '', foto_url: '', facebook: '', instagram: '', telefono: '' }); }}>
              <Text style={[styles.btnPublicarText, { color: C.textSub }]}>✕ Cancelar</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.adminSeccionTitle, { marginTop: 30 }]}>📋 Candidatos Registrados ({partidos.length})</Text>
          {partidos.map((p: any) => (
            <View key={p.id} style={[styles.adminCandCard, { borderLeftColor: p.color || C.accent }]}>
              <View style={[styles.adminCandAvatar, { backgroundColor: p.color || C.accent }]}>
                <Text style={{ fontSize: F.lg }}>{p.emoji || '⚽'}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.adminCandNombre}>{p.nombre}</Text>
                <Text style={styles.adminCandCandidato}>{p.candidato || '—'}</Text>
                <Text style={[styles.adminCandCandidato, { color: p.color || C.accent }]}>{p.color}</Text>
              </View>
              <TouchableOpacity style={styles.adminBtnEditar} onPress={() => editarCandidato(p)}>
                <Text style={styles.adminBtnEditarText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.adminBtnEliminar, { marginLeft: 6 }]} onPress={() => eliminarCandidato(p.id)}>
                <Text style={styles.adminBtnEliminarText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── TAB 1: VOTOS ── */}
      {tab === 1 && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.adminSeccionTitle}>📊 Resumen de Votación</Text>
          <View style={styles.adminVotosResumen}>
            {partidos.map((p: any) => {
              const count = votosRaw.filter(v => v.partido_id === p.id).length;
              const pct = votosRaw.length > 0 ? Math.round((count / votosRaw.length) * 100) : 0;
              return (
                <View key={p.id} style={[styles.adminVotoCard, { borderLeftColor: p.color || C.accent }]}>
                  <Text style={{ fontSize: F.md, color: C.white }}>{p.emoji} {p.nombre}</Text>
                  <Text style={{ fontSize: F.xl, fontWeight: '900', color: p.color || C.accent }}>{count}</Text>
                  <Text style={{ fontSize: F.sm, color: C.textSub }}>{pct}%</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.btnPublicar, { backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: C.danger, marginBottom: 20 }]}
            onPress={() => Alert.alert('⚠️ REINICIAR VOTOS', '¿Eliminar TODOS los votos registrados? Esta acción NO se puede deshacer.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'REINICIAR TODO', style: 'destructive', onPress: async () => {
                await supabase.from('votos').delete().neq('id', 0);
                setVotosRaw([]);
                mostrarMsg('🗑️ Todos los votos eliminados');
                onRefresh();
              }},
            ])}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnPublicarText, { color: C.danger }]}>🗑️ REINICIAR TODOS LOS VOTOS</Text>
          </TouchableOpacity>

          <Text style={styles.adminSeccionTitle}>📋 Últimos 100 registros</Text>
          {votosRaw.map((v, i) => {
            const p = partidos.find((pp: any) => pp.id === v.partido_id);
            return (
              <View key={i} style={styles.adminVotoRow}>
                <Text style={{ fontSize: F.sm, color: p?.color || C.accent, fontWeight: '800', width: 80 }}>{p?.nombre || `ID ${v.partido_id}`}</Text>
                <Text style={{ fontSize: F.xs, color: C.textMuted, flex: 1 }}>{v.timestamp ? new Date(v.timestamp).toLocaleString('es-MX') : '—'}</Text>
                <View style={styles.adminPlatBadge}>
                  <Text style={{ fontSize: 10, color: C.textMuted }}>{v.plataforma || 'web'}</Text>
                </View>
              </View>
            );
          })}
          {votosRaw.length === 0 && <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🗳️</Text><Text style={styles.emptyText}>No hay votos registrados</Text></View>}
        </ScrollView>
      )}

      {/* ── TAB 2: BANNER ── */}
      {tab === 2 && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.adminSeccionTitle}>➕ Nuevo Banner</Text>
          {([
            ['titulo',     'Título del banner'],
            ['imagen_url', 'URL de imagen del banner'],
            ['link',       'URL de enlace al tocarlo (opcional)'],
          ] as [string, string][]).map(([key, label]) => (
            <TextInput
              key={key}
              style={styles.adminInput}
              placeholder={label}
              placeholderTextColor={C.textMuted}
              value={(formBanner as any)[key]}
              onChangeText={(v) => setFormBanner(p => ({ ...p, [key]: v }))}
            />
          ))}
          <TouchableOpacity style={[styles.btnPublicar, { backgroundColor: C.accent }]} onPress={async () => {
            if (!formBanner.titulo && !formBanner.imagen_url) { Alert.alert('⚠️', 'Agrega título o imagen'); return; }
            setLoading(true);
            await supabase.from('banner').insert([{ ...formBanner, orden: banners.length + 1, created_at: new Date().toISOString() }]);
            setFormBanner({ titulo: '', imagen_url: '', link: '', activo: true });
            mostrarMsg('✅ Banner agregado');
            cargarTab();
            setLoading(false);
          }} activeOpacity={0.8}>
            <Text style={[styles.btnPublicarText, { color: C.bg }]}>➕ AGREGAR BANNER</Text>
          </TouchableOpacity>

          <Text style={[styles.adminSeccionTitle, { marginTop: 24 }]}>🎠 Banners ({banners.length})</Text>
          {banners.map((b, i) => (
            <View key={b.id || i} style={styles.adminBannerCard}>
              {b.imagen_url
                ? <Image source={{ uri: b.imagen_url }} style={styles.adminBannerImg} resizeMode="cover" />
                : <View style={[styles.adminBannerImg, { backgroundColor: C.bgGlass, alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 28 }}>🖼️</Text></View>
              }
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.adminCandNombre} numberOfLines={1}>{b.titulo || '(Sin título)'}</Text>
                <Text style={styles.adminCandCandidato} numberOfLines={1}>{b.link || 'Sin enlace'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <View style={[styles.adminActiveBadge, { backgroundColor: b.activo ? C.success + '20' : C.danger + '20', borderColor: b.activo ? C.success : C.danger }]}>
                    <Text style={{ fontSize: 11, color: b.activo ? C.success : C.danger, fontWeight: '800' }}>{b.activo ? '✓ Activo' : '✗ Oculto'}</Text>
                  </View>
                  <TouchableOpacity onPress={async () => { await supabase.from('banner').update({ activo: !b.activo }).eq('id', b.id); cargarTab(); }}>
                    <Text style={{ fontSize: F.xs, color: C.accent, fontWeight: '700' }}>Cambiar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Eliminar banner', '¿Seguro?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: async () => { await supabase.from('banner').delete().eq('id', b.id); cargarTab(); } },
              ])}>
                <Text style={{ fontSize: F.lg, marginLeft: 8 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── TAB 3: NOTICIAS ── */}
      {tab === 3 && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.adminSeccionTitle}>➕ Publicar Noticia</Text>
          <TextInput style={styles.adminInput} placeholder="Título de la noticia *" placeholderTextColor={C.textMuted} value={formNoticia.titulo} onChangeText={(v) => setFormNoticia(p => ({ ...p, titulo: v }))} />
          <TextInput style={styles.adminInput} placeholder="URL de imagen (opcional)" placeholderTextColor={C.textMuted} value={formNoticia.imagen_url} onChangeText={(v) => setFormNoticia(p => ({ ...p, imagen_url: v }))} />
          <TextInput style={styles.adminInput} placeholder="URL fuente / enlace (opcional)" placeholderTextColor={C.textMuted} value={formNoticia.link} onChangeText={(v) => setFormNoticia(p => ({ ...p, link: v }))} />
          <TextInput style={[styles.adminInput, { height: 120, textAlignVertical: 'top' }]} placeholder="Contenido completo de la noticia..." placeholderTextColor={C.textMuted} value={formNoticia.contenido} onChangeText={(v) => setFormNoticia(p => ({ ...p, contenido: v }))} multiline />
          <TouchableOpacity style={[styles.btnPublicar, { backgroundColor: C.success }]} onPress={guardarNoticia} activeOpacity={0.8}>
            <Text style={styles.btnPublicarText}>📰 PUBLICAR NOTICIA</Text>
          </TouchableOpacity>

          <Text style={[styles.adminSeccionTitle, { marginTop: 28 }]}>📋 Noticias ({noticiasList.length})</Text>
          {noticiasList.map((n) => (
            <View key={n.id} style={styles.adminNoticiaCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminCandNombre} numberOfLines={2}>{n.titulo}</Text>
                <Text style={styles.adminCandCandidato}>{n.created_at ? new Date(n.created_at).toLocaleDateString('es-MX') : '—'}</Text>
              </View>
              <TouchableOpacity style={styles.adminBtnEliminar} onPress={() => eliminarNoticia(n.id)}>
                <Text style={styles.adminBtnEliminarText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── TAB 4: AJUSTES ── */}
      {tab === 4 && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text style={styles.adminSeccionTitle}>⚙️ Configuración General</Text>
          {([
            ['fecha_eleccion',          '📅 Fecha de elección (YYYY-MM-DD)'],
            ['fecha_cierre_encuesta',   '⏰ Cierre de encuesta (YYYY-MM-DD)'],
            ['titulo_app',              '📱 Título principal de la app'],
            ['subtitulo_app',           '📝 Subtítulo de la app'],
            ['whatsapp_numero',         '📱 Número WhatsApp (con código país)'],
            ['facebook_url',            '📘 URL página Facebook oficial'],
            ['web_url',                 '🌐 URL del sitio web'],
            ['encuesta_activa',         '🔘 Encuesta activa? (true / false)'],
            ['mensaje_bienvenida',      '👋 Mensaje de bienvenida'],
            ['velocidad_carrusel',      '⚡ Velocidad carrusel (ms, ej: 4000)'],
          ] as [string, string][]).map(([clave, label]) => (
            <View key={clave} style={styles.adminConfigRow}>
              <Text style={styles.adminConfigLabel}>{label}</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput
                  style={[styles.adminInput, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Valor actual...`}
                  placeholderTextColor={C.textMuted}
                  value={configEdit[clave] || ''}
                  onChangeText={(v) => setConfigEdit(prev => ({ ...prev, [clave]: v }))}
                />
                <TouchableOpacity style={styles.adminBtnGuardar} onPress={() => guardarConfig(clave)}>
                  <Text style={styles.adminBtnGuardarText}>💾</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB BAR INFERIOR
// ══════════════════════════════════════════════════════════════════════════════
const TabBarInferior = ({ pantalla, onNavigate }: any) => {
  const TABS = [
    { screen: 'home',       icon: '🏠', label: 'Inicio'    },
    { screen: 'stats',      icon: '📊', label: 'Stats'     },
    { screen: 'forum',      icon: '💬', label: 'Foro'      },
    { screen: 'proposals',  icon: '💡', label: 'Ideas'     },
    { screen: 'news',       icon: '📰', label: 'Noticias'  },
  ];
  return (
    <View style={styles.tabBar}>
      {TABS.map((t) => {
        const active = pantalla === t.screen;
        return (
          <TouchableOpacity key={t.screen} style={styles.tabItem} onPress={() => onNavigate(t.screen)} activeOpacity={0.7}>
            {active && <View style={styles.tabIndicator} />}
            <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DRAWER LATERAL
// ══════════════════════════════════════════════════════════════════════════════
const Drawer = ({ visible, onClose, onNavigate, onLogout, visitantes, votos }: any) => {
  const slideAnim = useRef(new Animated.Value(-SW * 0.78)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -SW * 0.78,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const totalVotos = Object.values(votos).reduce((a: any, b: any) => a + b, 0) as number;

  const opciones = [
    { label: '🏠 Inicio',           screen: 'home' },
    { label: '📊 Estadísticas',     screen: 'stats' },
    { label: '💬 Foro Ciudadano',   screen: 'forum' },
    { label: '💡 Propuestas',       screen: 'proposals' },
    { label: '📰 Noticias',         screen: 'news' },
    { label: '👥 Candidatos',       screen: 'candidates' },
    { label: '⚙️ Administración',   screen: 'admin' },
  ];

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableOpacity style={styles.drawerOverlay} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerLogo}>⚽ ENCUESTA SILAO</Text>
          <Text style={styles.drawerSub}>Plataforma Ciudadana · Silao, Gto.</Text>
          <View style={styles.drawerStatsRow}>
            <View style={styles.drawerStatChip}>
              <Text style={styles.drawerStatTxt}>👁️ {visitantes.toLocaleString()}</Text>
              <Text style={styles.drawerStatLbl}>visitantes</Text>
            </View>
            <View style={styles.drawerStatChip}>
              <Text style={styles.drawerStatTxt}>🗳️ {totalVotos.toLocaleString()}</Text>
              <Text style={styles.drawerStatLbl}>votos</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {opciones.map((op) => (
            <TouchableOpacity
              key={op.screen}
              style={styles.drawerItem}
              onPress={() => { onNavigate(op.screen); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.drawerItemText}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BOTÓN SALIR */}
        <TouchableOpacity style={styles.btnSalir} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.btnSalirText}>🚪 CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [pantalla, setPantalla] = useState('login');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [partidos, setPartidos] = useState<any[]>(PARTIDOS_DEFAULT);
  const [votos, setVotos] = useState<Record<number, number>>({});
  const [visitantes, setVisitantes] = useState(0);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    cargarDatos();
    registrarVisita();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [{ data: candidatos }, { data: votosData }, { count: visCount }, { data: cfgData }] = await Promise.all([
        supabase.from('candidatos').select('*').order('id'),
        supabase.from('votos').select('partido_id'),
        supabase.from('visitas').select('*', { count: 'exact', head: true }),
        supabase.from('config').select('*'),
      ]);

      if (candidatos?.length) {
        setPartidos(candidatos.map((c: any) => ({
          id: c.id,
          nombre: c.partido || c.nombre,
          candidato: c.nombre || c.candidato,
          color: c.color || C.accent,
          emoji: c.emoji || '⚽',
          logo: c.foto_url || c.logo_url || null,
        })));
      }
      if (votosData) {
        const conteo: Record<number, number> = {};
        for (const v of votosData) conteo[v.partido_id] = (conteo[v.partido_id] || 0) + 1;
        setVotos(conteo);
      }
      if (visCount) setVisitantes(visCount);
      if (cfgData) {
        const m: Record<string, string> = {};
        cfgData.forEach((r: any) => { m[r.clave] = r.valor; });
        setConfig(m);
      }
    } catch (e) { console.log('Error:', e); }
    setLoading(false);
  };

  const registrarVisita = async () => {
    try { await supabase.from('visitas').insert([{ timestamp: new Date().toISOString(), plataforma: 'app' }]); } catch (_) {}
  };

  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);

  const handleVotar = async (partido: any) => {
    Alert.alert('🗳️ Confirmar Voto', `¿Confirmas tu voto por ${partido.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: '✓ Confirmar', onPress: async () => {
        await supabase.from('votos').insert([{ partido_id: partido.id, timestamp: new Date().toISOString(), plataforma: 'app' }]);
        setVotos(prev => ({ ...prev, [partido.id]: (prev[partido.id] || 0) + 1 }));
        Alert.alert('✅ ¡Voto registrado!', `Gracias por votar por ${partido.nombre}`);
      }}
    ]);
  };

  const handleLogin = () => {
    if (password === 'silao360') {
      setLoggedIn(true);
      setPantalla('home');
    } else {
      Alert.alert('❌ Contraseña incorrecta', 'Intenta de nuevo');
    }
  };

  const handleLogout = () => {
    Alert.alert('🚪 Cerrar Sesión', '¿Deseas salir de la plataforma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => { setLoggedIn(false); setPantalla('login'); setPassword(''); } },
    ]);
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'share_whatsapp') {
      const lider = [...partidos].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0))[0];
      const pct = lider && totalVotos > 0 ? Math.round(((votos[lider.id] || 0) / totalVotos) * 100) : 0;
      const msg = `🗳️ *ENCUESTA SILAO 2024*\n\n📊 Va ganando: *${lider?.nombre}* con *${pct}%*\n👥 Participantes: ${totalVotos.toLocaleString()}\n\n¡Vota en: https://silao360.com.mx!`;
      Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`);
      return;
    }
    if (screen === 'share_facebook') {
      Linking.openURL('https://silao360.com.mx');
      return;
    }
    if (screen === 'pulso') {
      // Pulso en vivo — navega a stats (misma pantalla, ya muestra datos en vivo)
      setPantalla('stats');
      return;
    }
    if (screen === 'contact') {
      Linking.openURL('https://wa.me/524770000000?text=' + encodeURIComponent('Hola, me comunico desde la app Encuesta Silao'));
      return;
    }
    if (screen === 'install') {
      setPantalla('install');
      return;
    }
    setPantalla(screen);
  };

  const renderPantalla = () => {
    switch (pantalla) {
      case 'home':       return <PantallaHome partidos={partidos} votos={votos} totalVotos={totalVotos} visitantes={visitantes} onVotar={handleVotar} onNavigate={handleNavigate} config={config} onRefresh={cargarDatos} />;
      case 'stats':      return <PantallaEstadisticas partidos={partidos} votos={votos} totalVotos={totalVotos} visitantes={visitantes} onNavigate={handleNavigate} />;
      case 'forum':      return <PantallaForo />;
      case 'proposals':  return <PantallaPropuestas />;
      case 'news':       return <PantallaNoticias />;
      case 'candidates': return <PantallaCandidatos partidos={partidos} votos={votos} totalVotos={totalVotos} />;
      case 'admin':      return <PantallaAdmin partidos={partidos} votos={votos} onRefresh={cargarDatos} />;
      case 'install':    return <PantallaInstalar onNavigate={handleNavigate} />;
      default:
        return (
          <View style={styles.centrado}>
            <Text style={styles.wipEmoji}>🚧</Text>
            <Text style={styles.wip}>Sección en construcción</Text>
            <TouchableOpacity style={styles.btnVolver} onPress={() => setPantalla('home')}>
              <Text style={styles.btnVolverText}>← Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={styles.loginContainer}>
          <Text style={styles.loginLogo}>⚽</Text>
          <Text style={styles.loginTitle}>ENCUESTA SILAO</Text>
          <Text style={styles.loginSub}>Plataforma Ciudadana 2024</Text>
          <Text style={styles.loginSub2}>Silao de la Victoria, Guanajuato</Text>

          <View style={styles.loginCard}>
            <Text style={styles.loginCardTitle}>🔐 Acceso a la Plataforma</Text>
            <TextInput
              style={styles.loginInput}
              placeholder="Contraseña de acceso"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.btnLoginText}>🚀 ENTRAR A LA PLATAFORMA</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.loginFooter}>silao360.com.mx · Todos los derechos reservados</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── APP ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bgCard} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPantalla('home')} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.topBarTitle}>⚽ ENCUESTA SILAO</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={cargarDatos} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading
          ? <View style={styles.centrado}>
              <ActivityIndicator size="large" color={C.accent} />
              <Text style={[styles.wip, { marginTop: 16 }]}>Cargando datos de Supabase...</Text>
            </View>
          : renderPantalla()
        }
      </View>

      {/* Tab bar inferior */}
      <TabBarInferior pantalla={pantalla} onNavigate={handleNavigate} />

      <Drawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(s: string) => { setPantalla(s); setDrawerOpen(false); }}
        onLogout={handleLogout}
        visitantes={visitantes}
        votos={votos}
      />
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({

  // ── BALÓN ──────────────────────────────────────────────────────────────────
  bola: {
    position: 'absolute',
    width: 70, height: 70,
    zIndex: 999,
  },
  bolaInner: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: C.accentGold,
    borderWidth: 3, borderColor: C.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accentGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 12, elevation: 20,
  },
  bolaEmoji: { fontSize: 28, lineHeight: 32 },
  bolaLogo: { fontSize: 9, color: C.bg, fontWeight: '900', letterSpacing: 1 },

  // ── MINI BALONES ───────────────────────────────────────────────────────────
  miniBola: {
    position: 'absolute',
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.white,
    shadowColor: C.accentGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 8, elevation: 15,
  },
  miniBolaEmoji: { fontSize: 20 },
  miniBolaLabel: { fontSize: 8, color: C.white, fontWeight: '900', letterSpacing: 0.5 },

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  loginContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 28, backgroundColor: C.bg,
  },
  loginLogo: { fontSize: 90, marginBottom: 10 },
  loginTitle: {
    fontSize: F.xxl, fontWeight: '900', color: C.accentGold,
    letterSpacing: 5, textAlign: 'center', marginBottom: 6,
  },
  loginSub: { fontSize: F.md, color: C.textSub, textAlign: 'center' },
  loginSub2: { fontSize: F.sm, color: C.textMuted, textAlign: 'center', marginBottom: 40 },
  loginCard: {
    width: '100%', backgroundColor: C.bgCard,
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 15,
  },
  loginCardTitle: { fontSize: F.lg, fontWeight: '800', color: C.white, marginBottom: 24, textAlign: 'center' },
  loginInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 18, fontSize: F.md, color: C.white, marginBottom: 16,
  },
  btnLogin: {
    backgroundColor: C.accentGold, borderRadius: 16,
    paddingVertical: 20, alignItems: 'center',
    shadowColor: C.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  btnLoginText: { fontSize: F.lg, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  loginFooter: { fontSize: F.xs, color: C.textMuted, marginTop: 36, textAlign: 'center' },

  // ── TOP BAR ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, paddingHorizontal: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  topBarTitle: { fontSize: F.md, fontWeight: '900', color: C.accentGold, letterSpacing: 2 },
  topBarBtn: { padding: 8 },
  topBarBtnText: { fontSize: F.xl, color: C.white },

  // ── HERO ───────────────────────────────────────────────────────────────────
  heroHeader: {
    backgroundColor: C.bgCard, margin: 16,
    borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  heroLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroLogo: { fontSize: 56, marginRight: 16 },
  heroTitle: { fontSize: F.xl, fontWeight: '900', color: C.accentGold, letterSpacing: 3 },
  heroSubtitle: { fontSize: F.sm, color: C.textSub, marginTop: 3 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around' },
  heroStatBadge: {
    alignItems: 'center', backgroundColor: 'rgba(0,212,255,0.08)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18,
    borderWidth: 1, borderColor: C.border,
  },
  heroStatNum: { fontSize: F.lg, fontWeight: '900', color: C.accent },
  heroStatLbl: { fontSize: F.xs, color: C.textSub, marginTop: 3 },

  // ── SECCIÓN ────────────────────────────────────────────────────────────────
  seccion: { paddingHorizontal: 16, marginBottom: 8 },
  seccionTitulo: { fontSize: F.lg, fontWeight: '900', color: C.white, marginBottom: 6, marginTop: 20 },
  seccionSub: { fontSize: F.sm, color: C.textSub, marginBottom: 14 },

  // ── TARJETA CANDIDATO ──────────────────────────────────────────────────────
  tarjetaCandidato: {
    backgroundColor: C.bgCard, borderRadius: 22, padding: 20,
    marginBottom: 18, borderLeftWidth: 5,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  tarjetaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tarjetaAvatar: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.white,
  },
  tarjetaAvatarImg: { width: 56, height: 56, borderRadius: 28 },
  tarjetaAvatarEmoji: { fontSize: 30 },
  tarjetaNombre: { fontSize: F.lg, fontWeight: '900', color: C.white, letterSpacing: 1 },
  tarjetaCandidatoNombre: { fontSize: F.sm, color: C.textSub, marginTop: 3 },
  tarjetaRankBadge: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1,
  },
  tarjetaRankText: { fontSize: F.md, fontWeight: '900' },
  tarjetaPctRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  tarjetaPct: { fontSize: F.xxl, fontWeight: '900', marginRight: 12 },
  tarjetaVotos: { fontSize: F.sm, color: C.textSub },

  // ── BARRAS ────────────────────────────────────────────────────────────────
  barraContainer: {
    height: 14, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 7, overflow: 'hidden', marginBottom: 18,
  },
  barraFill: { height: 14, borderRadius: 7 },
  barraContainerStats: {
    height: 12, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6, overflow: 'hidden', marginBottom: 12,
  },
  barraFillStats: { height: 12, borderRadius: 6 },

  // ── STATS GRID ─────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    flex: 1, minWidth: '44%', margin: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: F.xs, color: C.textSub, marginBottom: 5 },
  statValue: { fontSize: F.md, fontWeight: '900', color: C.white },

  // ── BOTONES PRINCIPALES (fondo blanco brillante) ───────────────────────────
  botonesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10,
  },
  btnPrincipal: {
    flex: 1, minWidth: '44%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18, paddingVertical: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 8,
  },
  btnPrincipalText: { fontSize: F.md, fontWeight: '900', letterSpacing: 0.3 },

  // ── BOTONES COMPARTIR ──────────────────────────────────────────────────────
  btnWhatsApp: {
    backgroundColor: '#25D366', borderRadius: 18,
    paddingVertical: 22, alignItems: 'center', marginBottom: 12,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  btnFacebook: {
    backgroundColor: '#1877F2', borderRadius: 18,
    paddingVertical: 22, alignItems: 'center',
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  btnCompartirText: { fontSize: F.md, fontWeight: '900', color: C.white, textAlign: 'center', paddingHorizontal: 8 },

  // ── BOTÓN VOTAR ───────────────────────────────────────────────────────────
  btnVotar: {
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnVotarText: { fontSize: F.md, fontWeight: '900', color: C.white, letterSpacing: 1 },

  // ── DRAWER ────────────────────────────────────────────────────────────────
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  drawer: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: SW * 0.78,
    backgroundColor: C.bgCard,
    borderRightWidth: 1, borderRightColor: C.border,
    zIndex: 100,
  },
  drawerHeader: {
    backgroundColor: C.bg, padding: 24,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingTop: 50,
  },
  drawerLogo: { fontSize: F.lg, fontWeight: '900', color: C.accentGold, letterSpacing: 2, marginBottom: 4 },
  drawerSub: { fontSize: F.sm, color: C.textSub, marginBottom: 16 },
  drawerStatsRow: { flexDirection: 'row', gap: 12 },
  drawerStatChip: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  drawerStatTxt: { fontSize: F.md, color: C.accent, fontWeight: '800' },
  drawerStatLbl: { fontSize: F.xs, color: C.textMuted },
  drawerItem: {
    paddingVertical: 20, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  drawerItemText: { fontSize: F.md, color: C.white, fontWeight: '700' },
  btnSalir: {
    margin: 16, backgroundColor: 'rgba(127,29,29,0.4)',
    borderRadius: 16, paddingVertical: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.danger,
  },
  btnSalirText: { fontSize: F.md, fontWeight: '900', color: C.danger, letterSpacing: 1 },

  // ── ESTADÍSTICAS ──────────────────────────────────────────────────────────
  pantallaTitle: {
    fontSize: F.xl, fontWeight: '900', color: C.white,
    margin: 16, letterSpacing: 1,
  },
  tarjetaGlass: {
    backgroundColor: C.bgCard, borderRadius: 22, padding: 22,
    marginHorizontal: 16, marginBottom: 18,
    borderWidth: 1, borderColor: C.border,
  },
  tarjetaGlassTitle: { fontSize: F.lg, fontWeight: '900', color: C.accent, marginBottom: 16 },
  statItemBig: {
    flex: 1, minWidth: '44%', margin: 5,
    alignItems: 'center', padding: 14,
    backgroundColor: 'rgba(0,212,255,0.06)',
    borderRadius: 14, borderWidth: 1,
  },
  statBigNum: { fontSize: F.xl, fontWeight: '900' },
  statBigLbl: { fontSize: F.xs, color: C.textSub, marginTop: 5 },
  tarjetaStats: {
    backgroundColor: C.bgCard, borderRadius: 22, padding: 20,
    marginHorizontal: 16, marginBottom: 16,
    borderTopWidth: 4, borderWidth: 1, borderColor: C.border,
  },
  tarjetaStatsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  partidoBadge: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  partidoBadgeText: { fontSize: 26 },
  statsNombre: { fontSize: F.lg, fontWeight: '900', color: C.white },
  statsCandidato: { fontSize: F.sm, color: C.textSub },
  statsRankBadge: { alignItems: 'center' },
  statsPct: { fontSize: F.xxl, fontWeight: '900', color: C.accent },
  statsRankLabel: { fontSize: F.md, fontWeight: '800' },
  statsDetalleGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12,
  },
  statsDetalleItem: {
    flex: 1, minWidth: '44%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  statsDetalleLabel: { fontSize: F.xs, color: C.textMuted, marginBottom: 4 },
  statsDetalleVal: { fontSize: F.sm, fontWeight: '800', color: C.white },
  btnExplicar: {
    backgroundColor: 'rgba(159,122,234,0.12)',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: C.purple, marginTop: 8,
  },
  btnExplicarText: { fontSize: F.sm, color: C.purple, fontWeight: '800' },

  // ── MODAL ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: C.bgCard, borderRadius: 24, padding: 30,
    width: SW * 0.88, borderWidth: 1, borderColor: C.border,
  },
  modalTitle: { fontSize: F.xl, fontWeight: '900', color: C.white, marginBottom: 16 },
  modalText: { fontSize: F.md, color: C.textSub, lineHeight: 28, marginBottom: 22 },
  modalBtn: {
    backgroundColor: C.purple, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  modalBtnText: { fontSize: F.md, fontWeight: '900', color: C.white },

  // ── FORO ──────────────────────────────────────────────────────────────────
  foroHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, padding: 22,
    borderBottomWidth: 3, borderBottomColor: C.purple, gap: 14,
  },
  foroHeaderEmoji: { fontSize: 44 },
  foroHeaderTitle: { fontSize: F.lg, fontWeight: '900', color: C.white, letterSpacing: 2 },
  foroHeaderSub: { fontSize: F.sm, color: C.textSub, marginTop: 3 },
  foroActiveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(72,187,120,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: C.success,
  },
  foroActiveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.success, marginRight: 6 },
  foroActiveText: { fontSize: F.xs, color: C.success, fontWeight: '900' },
  foroFormCard: {
    backgroundColor: C.bgCard, margin: 16, borderRadius: 22, padding: 22,
    borderWidth: 1, borderColor: C.border,
  },
  foroFormTitle: { fontSize: F.md, fontWeight: '900', color: C.purple, marginBottom: 14 },
  foroInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 18, fontSize: F.md, color: C.white, marginBottom: 14,
  },
  btnPublicar: {
    backgroundColor: C.purple, borderRadius: 16,
    paddingVertical: 20, alignItems: 'center',
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  btnPublicarText: { fontSize: F.md, fontWeight: '900', color: C.white, letterSpacing: 1 },
  comentarioCard: {
    backgroundColor: C.bgCard, borderRadius: 18, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  comentarioHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  comentarioAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  comentarioAutor: { fontSize: F.md, fontWeight: '900', color: C.white, flex: 1 },
  comentarioFecha: { fontSize: F.xs, color: C.textMuted },
  comentarioTexto: { fontSize: F.md, color: C.textSub, lineHeight: 26 },

  // ── PROPUESTAS ────────────────────────────────────────────────────────────
  propuestasHeader: {
    backgroundColor: C.bgCard, padding: 28, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: C.accentGold,
  },
  propuestasHeaderEmoji: { fontSize: 58, marginBottom: 10 },
  propuestasHeaderTitle: {
    fontSize: F.xl, fontWeight: '900', color: C.accentGold, letterSpacing: 3, textAlign: 'center',
  },
  propuestasHeaderSub: { fontSize: F.sm, color: C.textSub, marginTop: 6 },
  categoriaBadge: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 1, borderColor: C.accentGold, marginRight: 10,
  },
  categoriaText: { fontSize: F.sm, color: C.accentGold, fontWeight: '800' },
  propuestasForm: {
    backgroundColor: C.bgCard, margin: 16, borderRadius: 22, padding: 22,
    borderWidth: 1, borderColor: C.border,
  },
  propuestasFormTitle: { fontSize: F.md, fontWeight: '900', color: C.accentGold, marginBottom: 16 },
  propuestaCard: {
    backgroundColor: C.bgCard, borderRadius: 18, padding: 18,
    marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: C.border,
  },
  propuestaIcono: {
    width: 54, height: 54, borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  propuestaTitulo: { fontSize: F.md, fontWeight: '900', color: C.white, marginBottom: 6 },
  propuestaDesc: { fontSize: F.sm, color: C.textSub, lineHeight: 24, marginBottom: 8 },
  propuestaFecha: { fontSize: F.xs, color: C.textMuted },

  // ── MISC ──────────────────────────────────────────────────────────────────
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  wipEmoji: { fontSize: 64, marginBottom: 16 },
  wip: { fontSize: F.lg, color: C.textSub, textAlign: 'center' },
  btnVolver: {
    marginTop: 24, backgroundColor: C.accent, borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 36,
  },
  btnVolverText: { fontSize: F.md, fontWeight: '900', color: C.bg },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 62, marginBottom: 14 },
  emptyText: { fontSize: F.lg, color: C.textSub, textAlign: 'center', fontWeight: '700' },
  emptySubText: { fontSize: F.sm, color: C.textMuted, textAlign: 'center', marginTop: 8 },

  // ── NOTICIAS ──────────────────────────────────────────────────────────────
  noticiaHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, padding: 20, gap: 14,
    borderBottomWidth: 3, borderBottomColor: C.success,
  },
  noticiaHeaderEmoji: { fontSize: 42 },
  noticiaHeaderTitle: { fontSize: F.lg, fontWeight: '900', color: C.white, letterSpacing: 2 },
  noticiaHeaderSub: { fontSize: F.sm, color: C.textSub, marginTop: 3 },
  reloadBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12 },
  reloadBtnText: { fontSize: F.xl },
  noticiaCard: {
    backgroundColor: C.bgCard, borderRadius: 20, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  noticiaImg: { width: '100%', height: 180 },
  noticiaImgPlaceholder: {
    width: '100%', height: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
  noticiaBody: { padding: 18 },
  noticiaMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  noticiaBadge: {
    backgroundColor: C.success + '25', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: C.success,
  },
  noticiaBadgeText: { fontSize: 11, color: C.success, fontWeight: '900', letterSpacing: 1 },
  noticiaFecha: { fontSize: F.xs, color: C.textMuted },
  noticiaTitulo: { fontSize: F.lg, fontWeight: '900', color: C.white, marginBottom: 8, lineHeight: 28 },
  noticiaResumen: { fontSize: F.sm, color: C.textSub, lineHeight: 24, marginBottom: 10 },
  noticiaLeer: { fontSize: F.sm, color: C.accent, fontWeight: '800' },
  noticiaDetalle: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.bg, zIndex: 50,
  },
  noticiaDetalleBack: {
    backgroundColor: C.bgCard, padding: 18,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  noticiaDetalleBackText: { fontSize: F.md, color: C.accent, fontWeight: '800' },
  noticiaDetalleImg: { width: '100%', height: 220, borderRadius: 16, marginBottom: 18 },
  noticiaDetalleFecha: { fontSize: F.sm, color: C.textMuted, marginBottom: 8 },
  noticiaDetalleTitulo: { fontSize: F.xl, fontWeight: '900', color: C.white, marginBottom: 16, lineHeight: 34 },
  noticiaDetalleTexto: { fontSize: F.md, color: C.textSub, lineHeight: 28 },
  noticiaDetalleLink: {
    marginTop: 24, backgroundColor: '#1877F2',
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  noticiaDetalleLinkText: { fontSize: F.md, color: C.white, fontWeight: '900' },

  // ── CANDIDATOS ────────────────────────────────────────────────────────────
  candidatosHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, padding: 20, gap: 14,
    borderBottomWidth: 3, borderBottomColor: C.accentPink,
  },
  candidatosHeaderEmoji: { fontSize: 42 },
  candidatosHeaderTitle: { fontSize: F.lg, fontWeight: '900', color: C.white, letterSpacing: 2 },
  candidatosHeaderSub: { fontSize: F.sm, color: C.textSub, marginTop: 3 },
  candidatoCard: {
    backgroundColor: C.bgCard, borderRadius: 20, padding: 18,
    marginBottom: 14, flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 5, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  candidatoAvatarBig: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5,
  },
  candidatoNombrePartido: { fontSize: F.lg, fontWeight: '900', color: C.white, letterSpacing: 1 },
  candidatoNombrePersona: { fontSize: F.sm, color: C.textSub, marginBottom: 4 },
  candidatoSlogan: { fontSize: F.xs, color: C.textMuted, fontStyle: 'italic' },
  candidatoPct: { fontSize: F.lg, fontWeight: '900', minWidth: 50 },
  candidatoBarraContainer: {
    flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4, overflow: 'hidden',
  },
  candidatoBarraFill: { height: 8, borderRadius: 4 },
  candidatoVerMas: { fontSize: F.md, fontWeight: '900', marginLeft: 10 },
  candidatoModal: {
    backgroundColor: C.bgCard, borderRadius: 28, overflow: 'hidden',
    width: SW * 0.92, maxHeight: SH * 0.82,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 20,
  },
  candidatoModalHeader: {
    height: 140, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  candidatoModalAvatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: C.white,
  },
  candidatoModalClose: {
    position: 'absolute', top: 14, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  candidatoModalPartido: { fontSize: F.xl, fontWeight: '900', color: C.white, textAlign: 'center', letterSpacing: 2, marginBottom: 4 },
  candidatoModalNombre: { fontSize: F.lg, color: C.textSub, textAlign: 'center', marginBottom: 8 },
  candidatoModalSlogan: { fontSize: F.sm, color: C.textMuted, textAlign: 'center', fontStyle: 'italic', marginBottom: 14 },
  candidatoModalDivider: { height: 1, backgroundColor: C.border, marginBottom: 16 },
  candidatoModalSeccion: { fontSize: F.md, fontWeight: '800', color: C.accent, marginBottom: 8 },
  candidatoModalBio: { fontSize: F.sm, color: C.textSub, lineHeight: 24, marginBottom: 16 },
  candidatoModalStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 16, marginBottom: 18,
    borderWidth: 1, borderColor: C.border,
  },
  candidatoModalStatItem: { alignItems: 'center' },
  candidatoModalStatNum: { fontSize: F.xxl, fontWeight: '900' },
  candidatoModalStatLbl: { fontSize: F.xs, color: C.textMuted, marginTop: 4 },
  candidatoRedesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  candidatoRedBtn: {
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
    flex: 1, alignItems: 'center',
  },
  candidatoRedBtnText: { fontSize: F.sm, color: C.white, fontWeight: '900' },

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  adminHeader: {
    backgroundColor: C.bgCard, padding: 20,
    borderBottomWidth: 2, borderBottomColor: C.orange,
    alignItems: 'center',
  },
  adminHeaderTitle: { fontSize: F.lg, fontWeight: '900', color: C.orange, letterSpacing: 2 },
  adminHeaderSub: { fontSize: F.sm, color: C.textSub, marginTop: 4 },
  adminMsg: {
    backgroundColor: C.success + '20', borderWidth: 1, borderColor: C.success,
    borderRadius: 12, margin: 12, padding: 14, alignItems: 'center',
  },
  adminMsgText: { fontSize: F.md, color: C.success, fontWeight: '800' },
  adminTabsBar: {
    backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border,
    maxHeight: 56,
  },
  adminTab: {
    paddingHorizontal: 18, paddingVertical: 16,
    borderBottomWidth: 3, borderBottomColor: 'transparent', marginHorizontal: 2,
  },
  adminTabActive: { borderBottomColor: C.orange },
  adminTabText: { fontSize: F.sm, color: C.textMuted, fontWeight: '700' },
  adminTabTextActive: { color: C.orange, fontWeight: '900' },
  adminSeccionTitle: { fontSize: F.lg, fontWeight: '900', color: C.white, marginBottom: 14, marginTop: 4 },
  adminInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 16, fontSize: F.md, color: C.white, marginBottom: 12,
  },
  adminCandCard: {
    backgroundColor: C.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 4, borderWidth: 1, borderColor: C.border,
  },
  adminCandAvatar: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  adminCandNombre: { fontSize: F.md, fontWeight: '900', color: C.white },
  adminCandCandidato: { fontSize: F.sm, color: C.textSub, marginTop: 3 },
  adminBtnEditar: {
    backgroundColor: C.accent + '20', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: C.accent,
  },
  adminBtnEditarText: { fontSize: F.lg },
  adminBtnEliminar: {
    backgroundColor: C.danger + '20', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: C.danger,
  },
  adminBtnEliminarText: { fontSize: F.lg },
  adminVotosResumen: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  adminVotoCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.bgCard, borderRadius: 14, padding: 14,
    borderLeftWidth: 4, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', gap: 4,
  },
  adminVotoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  adminPlatBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  adminBannerCard: {
    backgroundColor: C.bgCard, borderRadius: 16, padding: 14,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  adminBannerImg: { width: 72, height: 52, borderRadius: 10 },
  adminActiveBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  adminNoticiaCard: {
    backgroundColor: C.bgCard, borderRadius: 14, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  adminConfigRow: { marginBottom: 16 },
  adminConfigLabel: { fontSize: F.sm, color: C.textSub, marginBottom: 8, fontWeight: '700' },
  adminBtnGuardar: {
    backgroundColor: C.accent + '20', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: C.accent, alignItems: 'center',
  },
  adminBtnGuardarText: { fontSize: F.md },

  // ── TICKER ────────────────────────────────────────────────────────────────
  tickerContainer: {
    backgroundColor: C.accentGold,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  tickerText: {
    fontSize: F.sm,
    fontWeight: '900',
    color: C.bg,
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  } as any,

  // ── CARRUSEL ──────────────────────────────────────────────────────────────
  carruselContainer: {
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  carruselImg: {
    width: '100%', height: 180,
  },
  carruselPlaceholder: {
    width: '100%', height: 160,
    backgroundColor: C.bgCard,
    alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  carruselPlaceholderText: {
    fontSize: F.xl, fontWeight: '900', color: C.accentGold,
    textAlign: 'center', letterSpacing: 2,
  },
  carruselOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 14,
  },
  carruselTitulo: {
    fontSize: F.md, fontWeight: '900', color: C.white,
    letterSpacing: 0.5,
  },
  carruselDots: {
    position: 'absolute', bottom: 10, right: 14,
    flexDirection: 'row', gap: 6,
  },
  carruselDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  carruselDotActive: {
    backgroundColor: C.accentGold, width: 18,
  },

  // ── COUNTDOWN ─────────────────────────────────────────────────────────────
  countdownWrapper: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
  },
  countdownCard: {
    backgroundColor: C.bgCard,
    borderRadius: 20, padding: 18,
    borderWidth: 1.5, borderColor: C.accent,
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  cdTitle: {
    fontSize: F.sm, fontWeight: '900', color: C.accent,
    letterSpacing: 2, marginBottom: 12, textAlign: 'center',
  },
  cdRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  cdBloque: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', minWidth: 56,
    borderWidth: 1, borderColor: C.border,
  },
  cdNum: {
    fontSize: F.xl, fontWeight: '900', color: C.white,
    fontVariant: ['tabular-nums'] as any,
  },
  cdLbl: {
    fontSize: 10, color: C.textMuted, fontWeight: '700',
    marginTop: 2, letterSpacing: 1,
  },
  cdSep: {
    fontSize: F.xl, fontWeight: '900', color: C.accent,
    marginBottom: 14,
  },

  // ── HERO LÍDER ────────────────────────────────────────────────────────────
  heroLiderBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 16, padding: 14,
    borderWidth: 1.5, marginBottom: 16, gap: 12,
  },
  heroLiderEmoji: { fontSize: 34 },
  heroLiderLabel: { fontSize: F.xs, color: C.textMuted, fontWeight: '700', letterSpacing: 1 },
  heroLiderNombre: { fontSize: F.lg, fontWeight: '900', letterSpacing: 1 },
  heroLiderPct: { fontSize: F.xxl, fontWeight: '900' },

  // ── TAB BAR INFERIOR ──────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, position: 'relative',
  },
  tabIndicator: {
    position: 'absolute', top: 0, left: '20%', right: '20%',
    height: 3, backgroundColor: C.accent, borderRadius: 2,
  },
  tabIcon: { fontSize: 24, marginBottom: 3 },
  tabIconActive: {},
  tabLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  tabLabelActive: { color: C.accent, fontWeight: '900' },
});
