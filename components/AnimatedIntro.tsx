import {ColorPalette} from '@/constants/Colors';
import { memo } from 'react';
import { StyleSheet, useWindowDimensions, Text, View, Image } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { ReText } from 'react-native-redash';

const content = [
  {
    title: "Participate",
    bg: ColorPalette.lime,
    fontColor: ColorPalette.pink,
  },
  {
    title: "Sing",
    bg: ColorPalette.brown,
    fontColor: ColorPalette.sky,
  },
  {
    title: "Win",
    bg: ColorPalette.orange,
    fontColor: ColorPalette.blue,
  },
  {
    title: "Let's go",
    bg: ColorPalette.teal,
    fontColor: ColorPalette.yellow,
  },

];

const AnimatedIntro = () => {
  const { width } = useWindowDimensions();
  const ballWidth = 34;
  const half = width / 2 - ballWidth / 2;

  const currentX = useSharedValue(half);
  const currentIndex = useSharedValue(0);
  const isAtStart = useSharedValue(true);
  const labelWidth = useSharedValue(0);
  const canGoToNext = useSharedValue(false);
  const didPlay = useSharedValue(false);

  const newColorIndex = useDerivedValue(() => {
    if (!isAtStart.value) {
      return (currentIndex.value + 1) % content.length;
    }
    return currentIndex.value;
  }, [currentIndex]);

  const textStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        currentX.value,
        [half, half + labelWidth.value / 2],
        [content[newColorIndex.value].fontColor, content[currentIndex.value].fontColor],
        'RGB'
      ),
      transform: [
        {
          translateX: interpolate(
            currentX.value,
            [half, half + labelWidth.value / 2],
            [half + 4, half - labelWidth.value / 2]
          ),
        },
      ],
    };
  }, [currentIndex, currentX]);

  const ballStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        currentX.value,
        [half, half + labelWidth.value / 2],
        [content[newColorIndex.value].fontColor, content[currentIndex.value].fontColor],
        'RGB'
      ),
      transform: [
        { translateX: currentX.value },
        { translateY: 17 }, // Move it 10px down
      ],
    };
  });


const mask = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(
    currentX.value,
    [half, half + labelWidth.value / 2],
    [content[newColorIndex.value].bg, content[currentIndex.value].bg],
    'RGB'
  ),
  transform: [{ translateX: currentX.value }, { translateY: 17 }], // Move it down
  width: width / 1.5,
  borderTopLeftRadius: 20,
  borderBottomLeftRadius: 20,
}), [currentIndex, currentX, labelWidth]);





  const style1 = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      currentX.value,
      [half, half + labelWidth.value / 2],
      [content[newColorIndex.value].bg, content[currentIndex.value].bg],
      'RGB'
    ),
    opacity: interpolate(1, [1, 0], [1, 0, 0, 0, 0, 0, 0]),
    transform: [
      {
        translateX: interpolate(1, [1, 0], [0, -width * 2, -width, -width, -width, -width, -width]),
      },
    ],
  }));

  const text = useDerivedValue(() => {
    const index = currentIndex.value;
    return content[index].title;
  }, [currentIndex]);

  useAnimatedReaction(
    () => labelWidth.value,
    (newWidth) => {
      currentX.value = withDelay(
        1000,
        withTiming(
          half + newWidth / 2,
          {
            duration: 800,
          },
          (finished) => {
            if (finished) {
              canGoToNext.value = true;
              isAtStart.value = false;
            }
          }
        )
      );
    },
    [labelWidth, currentX, half]
  );

  useAnimatedReaction(
    () => canGoToNext.value,
    (next) => {
      if (next) {
        canGoToNext.value = false;
        currentX.value = withDelay(
          1000,
          withTiming(
            half,
            {
              duration: 800,
            },
            (finished) => {
              if (finished) {
                currentIndex.value = (currentIndex.value + 1) % content.length;
                isAtStart.value = true;
                didPlay.value = false;
              }
            }
          )
        );
      }
    },
    [currentX, labelWidth]
  );

  return (
    <Animated.View style={[styles.wrapper, style1]}>
      <Animated.View style={[styles.content]}>
        <Animated.View style={[styles.ball, ballStyle]} />
        <Animated.View style={[styles.mask, mask]} />
        <ReText
          onLayout={(e) => {
            labelWidth.value = e.nativeEvent.layout.width + 4;
          }}
          style={[styles.title, textStyle]}
          text={text}
        />
      </Animated.View>
      
      <Animated.View style={styles.footer}>
  <View style={styles.curvedBg} />

  <View style={styles.bg}>
    <Image
      source={require('@/assets/images/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    <Animated.Text style={[styles.appName]}>
      My Music App
    </Animated.Text>
  </View>
</Animated.View>


    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  mask: {
    zIndex: 1,
    position: 'absolute',
    left: '0%',
    height: 44,
  },
  ball: {
    width: 40,
    height: 40,
    backgroundColor: '#000',
    borderRadius: 20,
    position: 'absolute',
    left: '0%',
    top: '55%', // Fine-tune vertical alignment
    zIndex: 10,
  },
  titleText: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    left: '0%',
    position: 'absolute',
  },
  content: {
    marginTop: 300,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 165,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 30,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  bg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  
  curvedBg: {
    position: 'absolute',
    bottom: 30,
    height: 200, // You can tweak this value
    width: '100%',
    backgroundColor: ColorPalette.grey,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: -1,
  },  
});
export default memo(AnimatedIntro);

