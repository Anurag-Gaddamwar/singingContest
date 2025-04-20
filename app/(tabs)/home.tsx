import { StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Image with Gradient Overlay */}
      <View style={StyleSheet.absoluteFill}>
        <Image source={require('@/assets/images/singing-bg.jpg')} style={styles.backgroundImage} />
        <LinearGradient colors={['rgba(0,0,0,0.6)', 'black']} style={StyleSheet.absoluteFill} />
      </View>

      <AnimatePresence>
        {isVisible && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            {/* Header with Blur */}
            <BlurView intensity={70} tint="dark" style={styles.header}>
              <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
              <Text style={styles.appName}>Sing & Win</Text>
            </BlurView>

            {/* CTA Button with Scale Effect */}
            <TouchableOpacity activeOpacity={0.8}>
              <MotiView
                from={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                style={styles.joinButton}
              >
                <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.gradientButton}>
                  <Text style={styles.joinButtonText}>Join a Competition</Text>
                </LinearGradient>
              </MotiView>
            </TouchableOpacity>

            {/* Section Title */}
            <Text style={styles.sectionTitle}>Ongoing Competitions</Text>

            {/* Horizontal Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.competitions}>
              {[
                { title: 'Superstar Showdown', image: require('@/assets/images/competition1.png') },
                { title: 'The Golden Mic', image: require('@/assets/images/competition2.png') },
                { title: 'Ultimate Sing-Off', image: require('@/assets/images/competition3.png') },
              ].map((item, index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateY: 30 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 150 }}
                  style={styles.competitionCard}
                >
                  <Image source={item.image} style={styles.competitionImage} />
                  <Text style={styles.competitionTitle}>{item.title}</Text>
                </MotiView>
              ))}
            </ScrollView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: 'black',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 25,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  joinButton: {
    marginBottom: 30,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  competitions: {
    flexDirection: 'row',
  },
  competitionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginRight: 15,
    width: 160,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  competitionImage: {
    width: 140,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  competitionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
