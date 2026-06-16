import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      onFinish();
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      onFinish();
    }
  };

  const slides = [
    {
      title: '¿Cansado de buscar figuritas?',
      description: 'Completá tu álbum del Mundial 2026 sin encuentros con extraños.',
      image: require("@/assets/images/onboarding/onboarding_1.png"),
    },
    {
      title: 'Registrá tus duplicados',
      description: 'Cargá las que te sobran y las que te faltan. FiguMatch las cruza por vos.',
      image: require("@/assets/images/onboarding/onboarding_2.png"),
    },
    {
      title: 'Intercambiá en tu kiosco amigo',
      description: 'Dejá tus figuritas, retirá las que necesitás. Seguro, sin dar datos personales.',
      image: require("@/assets/images/onboarding/onboarding_3.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background atmosphere elements */}
      {currentSlide === 0 && <View style={styles.slide1Gradient} />}
      {currentSlide === 1 && <View style={styles.slide2Atmosphere} />}
      {currentSlide === 2 && (
        <>
          <View style={styles.slide3Atmosphere1} />
          <View style={styles.slide3Atmosphere2} />
        </>
      )}

      {/* Header */}
      <View style={styles.header}>
        {currentSlide === 2 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Ionicons name="football" size={22} color={colors.primary} style={styles.soccerIcon} />
            <Text style={styles.logoText}>FiguMatch</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.mainContent}>
        {/* Illustration Canvas */}
        <View style={styles.imageContainer}>
          <Image
            source={ slides[currentSlide].image }
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.description}>{slides[currentSlide].description}</Text>
        </View>
      </View>

      {/* Footer Area - Consistent across all slides */}
      <View style={styles.footer}>
        {/* Unified Pill-style pagination dots */}
        <View style={styles.dotsBottomContainer}>
          <View style={currentSlide === 0 ? [styles.dotActivePill, { backgroundColor: colors.primary }] : styles.dotInactive} />
          <View style={currentSlide === 1 ? [styles.dotActivePill, { backgroundColor: colors.primary }] : styles.dotInactive} />
          <View style={currentSlide === 2 ? [styles.dotActivePill, { backgroundColor: colors.primary }] : styles.dotInactive} />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.actionButtonText}>
            {currentSlide === 2 ? 'Comenzar' : 'Siguiente'}
          </Text>
          {currentSlide === 1 && (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.arrowIcon} />
          )}
        </TouchableOpacity>

        {/* Verified Badge / Spacer */}
        {currentSlide === 1 ? (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#C1C6D7" />
            <Text style={styles.verifiedText}>Intercambios seguros y verificados</Text>
          </View>
        ) : (
          <View style={styles.badgePlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden', // Prevent negative offsets of absolute child elements from expanding the container bounds and causing scroll
  },
  
  // Background atmospheres matching designs with cross-platform shadow/blurs
  slide1Gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.04)',
    height: '35%',
    pointerEvents: 'none',
  },
  slide2Atmosphere: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
      },
      android: {
        elevation: 1,
      },
    }),
    pointerEvents: 'none',
  },
  slide3Atmosphere1: {
    position: 'absolute',
    top: '15%',
    left: '-10%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#D8E2FF',
    opacity: 0.4,
    ...Platform.select({
      ios: {
        shadowColor: '#D8E2FF',
        shadowRadius: 30,
        shadowOpacity: 0.5,
      },
    }),
    pointerEvents: 'none',
  },
  slide3Atmosphere2: {
    position: 'absolute',
    bottom: '35%',
    right: '-10%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#72FE88',
    opacity: 0.3,
    ...Platform.select({
      ios: {
        shadowColor: '#72FE88',
        shadowRadius: 40,
        shadowOpacity: 0.4,
      },
    }),
    pointerEvents: 'none',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  headerBtn: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soccerIcon: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },

  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  imageContainer: {
    width: '100%',
    maxWidth: 260, // Slightly reduced maximum dimensions to safely fit all mobile devices vertically
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#636366',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    alignItems: 'center',
    width: '100%',
  },

  dotsBottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dotActivePill: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C1C6D7',
  },

  actionButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 8,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: '#8B91A0',
    fontWeight: '500',
  },
  badgePlaceholder: {
    height: 16,
    marginTop: 16,
  },
});
