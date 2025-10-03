import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const CustomBottomTabs = ({ state, descriptors, navigation }) => {
    if (!state || !state.routes || !navigation) {
        return null;
    }

    const colorAnimations = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    const transformAnimations = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    const scaleAnimations = useRef(
        state.routes.map(() => new Animated.Value(1))
    ).current;

    useEffect(() => {
        colorAnimations.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: state.index === index ? 1 : 0,
                duration: 250,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }).start();
        });

        transformAnimations.forEach((transform, index) => {
            Animated.spring(transform, {
                toValue: state.index === index ? 1 : 0,
                tension: 120,
                friction: 8,
                useNativeDriver: true,
            }).start();
        });

        scaleAnimations.forEach((scale, index) => {
            Animated.spring(scale, {
                toValue: state.index === index ? 1.05 : 1,
                tension: 150,
                friction: 8,
                useNativeDriver: true,
            }).start();
        });
    }, [state.index]);

    const getTabIcon = (routeName, focused) => {
        const iconMap = {
            Home: 'home',
            Profile: 'person',
            Events: 'emoji-events',
            Notifications: focused ? 'notifications' : 'notifications-none',
            Settings: 'settings',
        };
        return iconMap[routeName] || 'help';
    };

    const getTabLabel = (routeName) => {
        const labelMap = {
            Home: 'Home',
            Profile: 'Profile',
            Notifications: 'Alerts',
            Settings: 'Settings',
            Events: 'Events',
        };
        return labelMap[routeName] || routeName;
    };

    const handleTabPress = (route, index) => {
        Animated.sequence([
            Animated.timing(scaleAnimations[index], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnimations[index], {
                toValue: state.index === index ? 1.05 : 1,
                tension: 150,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[
                    'rgba(17, 24, 39, 0.95)',
                    'rgba(31, 41, 55, 0.92)',
                    'rgba(55, 65, 81, 0.9)'
                ]}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={styles.topBorder} />

            <View style={styles.blurOverlay} />

            <View style={styles.tabContainer}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const iconName = getTabIcon(route.name, isFocused);
                    const label = getTabLabel(route.name);

                    const iconColor = colorAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(156, 163, 175, 0.8)', '#ffffff'],
                    });

                    const labelColor = colorAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(156, 163, 175, 0.7)', '#ffffff'],
                    });

                    const backgroundOpacity = colorAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    });

                    const slideY = transformAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, -2],
                    });

                    const indicatorScale = transformAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    });

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tabButton}
                            onPress={() => handleTabPress(route, index)}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                style={[
                                    styles.activeBackground,
                                    { opacity: backgroundOpacity }
                                ]}
                            >
                                <LinearGradient
                                    colors={[
                                        'rgba(59, 130, 246, 0.15)',
                                        'rgba(37, 99, 235, 0.1)',
                                        'rgba(29, 78, 216, 0.05)'
                                    ]}
                                    style={styles.activeGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.tabContent,
                                    {
                                        transform: [
                                            { scale: scaleAnimations[index] },
                                            { translateY: slideY }
                                        ]
                                    }
                                ]}
                            >
                                <Animated.View style={styles.iconContainer}>
                                    <Icon
                                        name={iconName}
                                        size={isFocused ? 28 : 24}
                                        color={isFocused ? '#ffffff' : 'rgba(156, 163, 175, 0.8)'}
                                    />
                                </Animated.View>

                                <Animated.Text
                                    style={[
                                        styles.tabLabel,
                                        {
                                            color: isFocused ? '#ffffff' : 'rgba(156, 163, 175, 0.7)',
                                            fontWeight: isFocused ? '600' : '500',
                                            opacity: isFocused ? 1 : 0.8,
                                        }
                                    ]}
                                >
                                    {label}
                                </Animated.Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.activeIndicator,
                                    {
                                        transform: [{ scaleX: indicatorScale }],
                                        opacity: isFocused ? 1 : 0,
                                    }
                                ]}
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#1d4ed8', '#1e40af']}
                                    style={styles.indicatorGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.safeArea} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.1)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: 'transparent',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        position: 'relative',
        borderRadius: 16,
        minHeight: 60,
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        zIndex: 1,
    },
    activeBackground: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        bottom: 2,
        borderRadius: 14,
        overflow: 'hidden',
    },
    activeGradient: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },

    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        height: 32,
        width: 32,
    },
    tabLabel: {
        fontSize: 11,
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 14,
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        left: '25%',
        right: '25%',
        height: 3,
        borderRadius: 2,
        overflow: 'hidden',
    },
    indicatorGradient: {
        flex: 1,
        borderRadius: 2,
    },
    safeArea: {
        height: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: 'transparent',
    },
});

export default CustomBottomTabs;