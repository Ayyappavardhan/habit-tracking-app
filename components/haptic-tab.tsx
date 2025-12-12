import haptics from '@/utils/haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Add haptic feedback for both iOS and Android
        haptics.tabChange();
        props.onPressIn?.(ev);
      }}
    />
  );
}
