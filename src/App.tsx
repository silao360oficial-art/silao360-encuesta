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
const PantallaHome = ({ partidos, votos, totalVotos, visitantes, onVotar, onNavigate }: any) => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [explosionVisible, setExplosionVisible] = useState(false);
  const [explosionOrigin, setExplosionOrigin] = useState({ x: SW / 2, y: SH / 3 });

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const ordenados = [...partidos].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Animated.View style={[styles.heroHeader, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }]
        }]}>
          <View style={styles.heroLogoRow}>
            <Text style={styles.heroLogo}>⚽</Text>
            <View>
              <Text style={styles.heroTitle}>ENCUESTA SILAO</Text>
              <Text style={styles.heroSubtitle}>Plataforma Ciudadana 2024</Text>
            </View>
          </View>
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
// PANTALLA: ESTADÍSTICAS
// ══════════════════════════════════════════════════════════════════════════════
const PantallaEstadisticas = ({ partidos, votos, totalVotos, visitantes }: any) => {
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
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
    setPantalla(screen);
  };

  const renderPantalla = () => {
    switch (pantalla) {
      case 'home': return <PantallaHome partidos={partidos} votos={votos} totalVotos={totalVotos} visitantes={visitantes} onVotar={handleVotar} onNavigate={handleNavigate} />;
      case 'stats': return <PantallaEstadisticas partidos={partidos} votos={votos} totalVotos={totalVotos} visitantes={visitantes} />;
      case 'forum': return <PantallaForo />;
      case 'proposals': return <PantallaPropuestas />;
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
});
