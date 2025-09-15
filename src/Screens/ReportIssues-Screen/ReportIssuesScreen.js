import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Pressable,
    PermissionsAndroid,
    Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import GetLocation from 'react-native-get-location';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';

const ReportIssuesScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState(null);
    const [issueImage, setIssueImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const categories = [
        'Cleanliness',
        'Safety',
        'Environment',
        'Drainage',
        'Construction',
        'Broken_resources',
        'Other'
    ];

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
        showConfirm,
    } = useModal();

    const mockIssues = [
        {
            id: '1',
            title: 'Broken Water Cooler',
            description: 'Water cooler in CS block not working',
            category: 'Broken_resources',
            status: 'pending',
            createdAt: '2024-08-20T10:30:00Z',
            image: null
        },
        {
            id: '2',
            title: 'Dirty Washroom',
            description: 'Washroom near library needs cleaning',
            category: 'Cleanliness',
            status: 'resolved',
            createdAt: '2024-08-18T14:15:00Z',
            image: null
        },
        {
            id: '3',
            title: 'Broken Window',
            description: 'Window glass broken in room 204',
            category: 'Safety',
            status: 'viewed',
            createdAt: '2024-08-15T09:45:00Z',
            image: null
        }
    ];

    useEffect(() => {
        fetchMyIssues();

        // Check location permission on mount
        if (Platform.OS === 'android') {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                .then(result => {
                    console.log('Location permission status on mount:', result);
                });
        }
    }, []);

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm();
    };

    const fetchMyIssues = async () => {
        try {
            setTimeout(() => {
                setMyIssues(mockIssues);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.log('Error fetching issues:', error);
            setLoading(false);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS !== "android") {
            return true;
        }

        try {
            // First check if permission is already granted
            const hasPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            if (hasPermission) {
                console.log("Location permission already granted");
                return true;
            }

            const fineGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "We need your precise location to capture your position accurately.",
                    buttonPositive: "OK",
                    buttonNegative: "Cancel",
                    buttonNeutral: "Ask Me Later"
                }
            );

            if (fineGranted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Precise location granted");
                return true;
            }

            if (fineGranted === PermissionsAndroid.RESULTS.DENIED) {
                console.log("Location permission denied");
                Alert.alert(
                    "Permission Denied",
                    "Location access is required to capture your current position."
                );
                return false;
            }

            if (fineGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                console.log("Permission permanently denied");
                Alert.alert(
                    "Permission Required",
                    "You have permanently denied location access. Please enable it from settings.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            }
        } catch (err) {
            console.warn("Permission error:", err);
            Alert.alert(
                "Permission Error",
                "An error occurred while requesting location permission."
            );
            return false;
        }

        return false;
    };

    const getCurrentLocation = async () => {
        setGettingLocation(true);

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            setGettingLocation(false);
            return;
        }

        try {
            const locationResult = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
            });

            const locationData = {
                type: "Point",
                coordinates: [locationResult.longitude, locationResult.latitude],
            };

            setLocation(JSON.stringify(locationData));
            showSuccess("Success", "Location captured successfully!");
            console.log("Location captured:", locationData);
        } catch (error) {
            console.log("Location error:", error);

            let errorTitle = "Location Error";
            let errorMessage = "An unexpected error occurred. Please try again.";

            switch (error.code) {
                case "CANCELLED":
                    errorTitle = "Location Canceled";
                    errorMessage = "Location retrieval was canceled.";
                    break;
                case "TIMEOUT":
                    errorTitle = "Location Timeout";
                    errorMessage = "Could not get location within time limit. Please try again.";
                    break;
                case "UNAVAILABLE":
                    errorTitle = "Location Unavailable";
                    errorMessage = "Location services are disabled. Please enable them and try again.";
                    break;
                case "PERMISSION_DENIED":
                    errorTitle = "Permission Denied";
                    errorMessage = "Location permission denied. Please enable it in settings.";
                    break;
                default:
                    if (error.message) {
                        errorMessage = error.message;
                    }
            }

            showError(errorTitle, errorMessage);
        } finally {
            setGettingLocation(false);
        }
    };

    const selectImage = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel || response.error) {
                return;
            }
            if (response.assets && response.assets[0]) {
                setIssueImage(response.assets[0]);
            }
        });
    };

    const submitIssue = async () => {
        if (!title.trim() || !description.trim() || !category) {
            showError('Error', 'Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            console.log('Submitting issue:', {
                title,
                description,
                category,
                location,
                issueImage
            });

            setTimeout(() => {
                setSubmitting(false);
                setModalVisible(false);
                resetForm();
                showModal({
                    title: 'Success',
                    message: 'Issue Submitted Successfully!',
                    type: 'success',
                });
                fetchMyIssues();
            }, 2000);

        } catch (error) {
            console.log('Error submitting issue:', error);
            setSubmitting(false);
            showError('Error', 'Failed to submit issue. Please try again.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setLocation(null);
        setIssueImage(null);
        setShowCategoryDropdown(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'viewed': return '#3b82f6';
            case 'resolved': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'viewed': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'rejected': return 'Rejected';
            default: return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderIssueCard = (issue) => (
        <View key={issue.id} style={styles.issueCard}>
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{issue.title}</Text>
                    <Text style={styles.cardCategory}>{issue.category.replace('_', ' ')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(issue.status)}</Text>
                </View>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
                {issue.description}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>{formatDate(issue.createdAt)}</Text>
                <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ViewIssuesDetail')}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Icon name="arrow-forward-ios" size={12} color="#1e3a8a" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Issues</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Reported Issues</Text>
                    <Text style={styles.sectionSubtitle}>Track your submitted reports</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1e3a8a" />
                        <Text style={styles.loadingText}>Loading your issues...</Text>
                    </View>
                ) : myIssues.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="report-problem" size={64} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>No Issues Reported</Text>
                        <Text style={styles.emptySubtitle}>Tap the + button to report your first issue</Text>
                    </View>
                ) : (
                    <View style={styles.issuesList}>
                        {myIssues.map(renderIssueCard)}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <LinearGradient
                    colors={['#1e3a8a', '#3b82f6']}
                    style={styles.fabGradient}
                >
                    <Icon name="add" size={28} color="#ffffff" />
                </LinearGradient>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Report New Issue</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Brief title for the issue"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe the issue in detail..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    maxLength={500}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category *</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                >
                                    <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
                                        {category ? category.replace('_', ' ') : 'Select category'}
                                    </Text>
                                    <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                                </TouchableOpacity>

                                {showCategoryDropdown && (
                                    <View style={styles.dropdown}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setCategory(cat);
                                                    setShowCategoryDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{cat.replace('_', ' ')}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Location</Text>
                                <TouchableOpacity
                                    style={styles.locationButton}
                                    onPress={getCurrentLocation}
                                    disabled={gettingLocation}
                                >
                                    {gettingLocation ? (
                                        <ActivityIndicator size="small" color="#1e3a8a" />
                                    ) : (
                                        <Icon name="my-location" size={20} color="#1e3a8a" />
                                    )}
                                    <Text style={styles.locationButtonText}>
                                        {location ? 'Location Captured' : 'Get Current Location'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Photo (Optional)</Text>
                                <TouchableOpacity
                                    style={styles.imageButton}
                                    onPress={selectImage}
                                >
                                    {issueImage ? (
                                        <Image source={{ uri: issueImage.uri }} style={styles.selectedImage} />
                                    ) : (
                                        <>
                                            <Icon name="add-a-photo" size={24} color="#1e3a8a" />
                                            <Text style={styles.imageButtonText}>Add Photo</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={submitIssue}
                                disabled={submitting}
                            >
                                <LinearGradient
                                    colors={submitting ? ['#9ca3af', '#6b7280'] : ['#1e3a8a', '#3b82f6']}
                                    style={styles.submitGradient}
                                >
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator size="small" color="#ffffff" />
                                            <Text style={[styles.submitText, { marginLeft: 8 }]}>Submitting...</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.submitText}>Submit Issue</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <CustomModal
                {...modalConfig}
                onClose={hideModal}
                navigation={navigation}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    issuesList: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    issueCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    cardCategory: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 14,
        color: '#1e3a8a',
        fontWeight: '500',
        marginRight: 4,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        borderRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalForm: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    dropdownText: {
        fontSize: 16,
        color: '#1e293b',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        marginTop: 4,
        backgroundColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#1e293b',
        textTransform: 'capitalize',
    },
    locationButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    locationButtonText: {
        fontSize: 16,
        color: '#1e3a8a',
        marginLeft: 8,
        fontWeight: '500',
    },
    imageButton: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 24,
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    imageButtonText: {
        fontSize: 14,
        color: '#1e3a8a',
        marginTop: 8,
        fontWeight: '500',
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    submitButton: {
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});

export default ReportIssuesScreen;