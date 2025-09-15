import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const CustomModal = ({
    visible = false,
    title = null,
    message = '',
    type = 'info', // 'info', 'error', 'success', 'warning'
    showButtons = false,
    onOk = null,
    onCancel = null,
    okText = 'OK',
    cancelText = 'Cancel',
    okNavigateTo = null,
    navigation = null,
    onClose = () => { },
    closeOnBackdrop = true,
}) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getModalConfig = () => {
        switch (type) {
            case 'error':
                return {
                    icon: 'error',
                    iconColor: '#ef4444',
                    gradientColors: ['#fef2f2', '#ffffff'],
                    borderColor: '#fecaca',
                };
            case 'success':
                return {
                    icon: 'check-circle',
                    iconColor: '#22c55e',
                    gradientColors: ['#f0fdf4', '#ffffff'],
                    borderColor: '#bbf7d0',
                };
            case 'warning':
                return {
                    icon: 'warning',
                    iconColor: '#f59e0b',
                    gradientColors: ['#fffbeb', '#ffffff'],
                    borderColor: '#fed7aa',
                };
            default: // info
                return {
                    icon: 'info',
                    iconColor: '#3b82f6',
                    gradientColors: ['#eff6ff', '#ffffff'],
                    borderColor: '#bfdbfe',
                };
        }
    };

    const config = getModalConfig();

    const handleOk = () => {
        if (onOk) {
            onOk();
        }
        if (okNavigateTo && navigation) {
            navigation.navigate(okNavigateTo);
        }
        onClose();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };

    const handleBackdropPress = () => {
        if (closeOnBackdrop) {
            onClose();
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: opacityAnim }
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    transform: [{ scale: scaleAnim }],
                                    borderColor: config.borderColor,
                                }
                            ]}
                        >
                            <LinearGradient
                                colors={config.gradientColors}
                                style={styles.modalContent}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            >
                                {/* Header with Icon */}
                                <View style={styles.headerContainer}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}15` }]}>
                                        <Icon
                                            name={config.icon}
                                            size={32}
                                            color={config.iconColor}
                                        />
                                    </View>
                                    {title && (
                                        <Text style={[styles.title, { color: config.iconColor }]}>
                                            {title}
                                        </Text>
                                    )}
                                </View>

                                {/* Message */}
                                <Text style={styles.message}>{message}</Text>

                                {/* Buttons */}
                                {showButtons ? (
                                    <View style={styles.buttonsContainer}>
                                        {onCancel && (
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={handleCancel}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.cancelButtonText}>
                                                    {cancelText}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={[
                                                styles.okButton,
                                                { backgroundColor: config.iconColor },
                                                !onCancel && styles.singleButton
                                            ]}
                                            onPress={handleOk}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={[config.iconColor, `${config.iconColor}dd`]}
                                                style={styles.okButtonGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                            >
                                                <Text style={styles.okButtonText}>
                                                    {okText}
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    // Auto-close button when no buttons specified
                                    <TouchableOpacity
                                        style={[styles.okButton, { backgroundColor: config.iconColor }]}
                                        onPress={onClose}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={[config.iconColor, `${config.iconColor}dd`]}
                                            style={styles.okButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                        >
                                            <Text style={styles.okButtonText}>OK</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </LinearGradient>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: width * 0.85,
        maxWidth: 400,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        overflow: 'hidden',
    },
    modalContent: {
        padding: 25,
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 25,
        fontWeight: '400',
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    okButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    singleButton: {
        flex: 1,
    },
    okButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    okButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
});

export default CustomModal;