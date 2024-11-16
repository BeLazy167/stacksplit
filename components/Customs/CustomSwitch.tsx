import { Switch, styled, Theme, createStyledContext } from 'tamagui';
import { withStaticProperties } from '@tamagui/core';

// Create styled components for custom switch
const StyledSwitch = styled(Switch, {
  backgroundColor: '$gray5',
  borderRadius: 999,
  width: 52,
  height: 32,
  padding: 2,
  cursor: 'pointer',

  variants: {
    size: {
      small: {
        scale: 0.8,
      },
      medium: {
        scale: 1,
      },
      large: {
        scale: 1.2,
      },
    },
  },

  defaultVariants: {
    size: 'medium',
  },
});

const StyledThumb = styled(Switch.Thumb, {
  width: 28,
  height: 28,
  backgroundColor: 'white',
  borderRadius: 999,
  shadowColor: 'black',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 2.5,

  // Animation properties
  transform: [{ translateX: -2 }],

  variants: {
    checked: {
      true: {
        backgroundColor: 'white',
        transform: [{ translateX: 20 }],
      },
    },
  } as const,
});

// Custom Switch component with animations
export const CustomSwitch = withStaticProperties(
  styled(StyledSwitch, {
    variants: {
      status: {
        active: {
          backgroundColor: '$blue10',
          pressStyle: {
            backgroundColor: '$blue9',
          },
        },
        error: {
          backgroundColor: '$red10',
          pressStyle: {
            backgroundColor: '$red9',
          },
        },
        warning: {
          backgroundColor: '$yellow10',
          pressStyle: {
            backgroundColor: '$yellow9',
          },
        },
        success: {
          backgroundColor: '$green10',
          pressStyle: {
            backgroundColor: '$green9',
          },
        },
      },
    } as const,

    defaultVariants: {
      status: 'active',
    },
  }),
  {
    Thumb: StyledThumb,
  }
);

// Usage example component
export function SwitchExample() {
  return (
    <Theme name="light">
      <CustomSwitch size="medium" status="active" animation="bouncy">
        <CustomSwitch.Thumb
          animation={[
            'quick',
            {
              transform: {
                type: 'lazy',
                damping: 15,
                mass: 1,
                stiffness: 120,
              },
            },
          ]}
        />
      </CustomSwitch>
    </Theme>
  );
}
