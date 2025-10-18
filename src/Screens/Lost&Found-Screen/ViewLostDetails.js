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
    Dimensions,
    Linking,
    Share,
    FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';

const { width } = Dimensions.get('window');

const ViewLostDetailsScreen = ({ navigation, route }) => {
    const { itemDetail } = route.params || {};
    console.log(itemDetail)

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
    } = useModal();


    const reportReasons = [
        'Spam or irrelevant content',
        'False information',
        'Inappropriate content',
        'Duplicate post',
        'Suspicious activity',
        'Other'
    ];

    useEffect(() => {
        fetchItemDetails();
    }, [itemDetail]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            setTimeout(() => {
                setItem(itemDetail);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.log('Error fetching item details:', error);
            setLoading(false);
            showError('Error', 'Failed to load item details');
        }
    };

    const handleContactPress = () => {
        if (item.isAnonymous) {
            setContactModalVisible(true);
        } else if (item.contactInfo) {
            if (item.contactInfo.includes('@')) {
                Linking.openURL(`mailto:${item.contactInfo}`);
            } else {
                Linking.openURL(`tel:${item.contactInfo}`);
            }
        }
    };

    const handleShare = async () => {
        try {
            const message = `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}\n\n${item.description}\n\nLocation: ${item.location}\nDate: ${formatDate(item.dateLostOrFound)}\n\nContact: ${item.contactInfo}`;

            await Share.share({
                message,
                title: `${item.type === 'lost' ? 'Lost' : 'Found'} Item: ${item.title}`,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        showSuccess('Success', `Item ${isBookmarked ? 'removed from' : 'added to'} bookmarks`);
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            showError('Error', 'Please select a reason for reporting');
            return;
        }

        setSubmittingReport(true);
        try {
            setTimeout(() => {
                setSubmittingReport(false);
                setReportModalVisible(false);
                setReportReason('');
                setReportDescription('');
                showSuccess('Success', 'Thank you for your report. We will review it shortly.');
            }, 2000);
        } catch (error) {
            console.log('Error submitting report:', error);
            setSubmittingReport(false);
            showError('Error', 'Failed to submit report. Please try again.');
        }
    };

    const openImageViewer = (index) => {
        setSelectedImageIndex(index);
        setImageViewerVisible(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTypeIcon = (itemType) => {
        return itemType === 'lost' ? 'search' : 'check-circle';
    };

    const getTypeColor = (itemType) => {
        return itemType === 'lost' ? '#ef4444' : '#10b981';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'resolved': return '#6b7280';
            case 'expired': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const renderImageGallery = () => {
        if (!item.photos || item.photos.length === 0) {
            return (
                <View style={styles.noImageContainer}>
                    <Icon name="image" size={48} color="#d1d5db" />
                    <Text style={styles.noImageText}>No images available</Text>
                </View>
            );
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageGallery}
            >
                {item.photos.map((photo, index) => (
                    <TouchableOpacity
                        key={photo._id}  // Changed from photo.id
                        onPress={() => openImageViewer(index)}
                        style={styles.galleryImageContainer}
                    >
                        <Image
                            source={{ uri: photo.url }}
                            style={styles.galleryImage}
                            resizeMode="cover"
                            onError={(error) => console.log('Gallery image error:', error)}
                        />
                        <View style={styles.imageOverlay}>
                            <Icon name="zoom-in" size={24} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderContactSection = () => {
        if (item.isAnonymous) {
            return (
                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.anonymousContactCard}>
                        <Icon name="visibility-off" size={24} color="#f59e0b" />
                        <View style={styles.anonymousContactText}>
                            <Text style={styles.anonymousContactTitle}>Anonymous Post</Text>
                            <Text style={styles.anonymousContactDescription}>
                                The poster chose to remain anonymous. You can send a message through the app.
                            </Text>
                        </View>
                    </View>
                    {/* <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => setContactModalVisible(true)}
                    >
                        <Icon name="message" size={20} color="#000" />
                        <Text style={styles.contactButtonText}>Send Message</Text>
                    </TouchableOpacity> */}
                </View>
            );
        }

        return (
            <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.contactCard}>
                    <View style={styles.contactHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {item.reportedBy?.fullName.split(' ').map(n => n[0]).join('')}
                            </Text>
                        </View>
                        <View style={styles.contactDetails}>
                            <Text style={styles.contactName}>{item.reportedBy?.fullName}</Text>
                            <Text style={styles.contactId}>{item.reportedBy?.uniId}</Text>
                            {/* {item.reportedBy.department && (
                                <Text style={styles.contactDepartment}>{item.reportedBy.department}</Text>
                            )} */}
                        </View>
                    </View>
                    {item.contactInfo && (
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={handleContactPress}
                        >
                            <Icon
                                name={item.contactInfo.includes('@') ? 'email' : 'phone'}
                                size={20}
                                color="#000"
                            />
                            <Text style={styles.contactButtonText}>
                                {item.contactInfo.includes('@') ? 'Send Email' : 'Call Now'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
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
                    <Text style={styles.headerTitle}>Item Details</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!item) {
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
                    <Text style={styles.headerTitle}>Item Details</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Item Not Found</Text>
                    <Text style={styles.errorSubtitle}>
                        The item you're looking for doesn't exist or has been removed.
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

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
                <Text style={styles.headerTitle}>Item Details</Text>
                <View style={styles.headerActions}>
                    {/* <TouchableOpacity
                        style={styles.headerActionButton}
                        onPress={handleBookmark}
                    >
                        <Icon
                            name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                            size={24}
                            color={isBookmarked ? '#f59e0b' : '#64748b'}
                        />
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.headerActionButton}
                        onPress={handleShare}
                    >
                        <Icon name="share" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.itemHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View style={styles.itemMeta}>
                            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                                <Icon name={getTypeIcon(item.type)} size={16} color="#ffffff" />
                                <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.category}>{item.category}</Text>
                </View>


                <View style={styles.statsContainer}>

                    <View style={styles.statItem}>
                        <Icon name="schedule" size={16} color="#64748b" />
                        <Text style={styles.statText}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>


                <View style={styles.imageSection}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    {renderImageGallery()}
                </View>


                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>

                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Icon name="event" size={20} color="#64748b" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>
                                    Date {item.type === 'lost' ? 'Lost' : 'Found'}
                                </Text>
                                <Text style={styles.detailValue}>{formatDate(item.dateLostOrFound)}</Text>
                            </View>
                        </View>

                        <View style={styles.detailItem}>
                            <Icon name="location-on" size={20} color="#64748b" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Location</Text>
                                <Text style={styles.detailValue}>{item.location}</Text>
                            </View>
                        </View>

                        {item.collectionInfo && (
                            <View style={styles.detailItem}>
                                <Icon name="place" size={20} color="#64748b" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Collection Point</Text>
                                    <Text style={styles.detailValue}>{item.collectionInfo}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {renderContactSection()}


            </ScrollView>





            <Modal
                animationType="fade"
                transparent={true}
                visible={imageViewerVisible}
                onRequestClose={() => setImageViewerVisible(false)}
            >
                <View style={styles.imageViewerOverlay}>
                    <TouchableOpacity
                        style={styles.imageViewerClose}
                        onPress={() => setImageViewerVisible(false)}
                    >
                        <Icon name="close" size={28} color="#ffffff" />
                    </TouchableOpacity>

                    {item.photos && item.photos.length > 0 && (
                        <FlatList
                            data={item.photos}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={selectedImageIndex}
                            getItemLayout={(data, index) => ({
                                length: width,
                                offset: width * index,
                                index,
                            })}
                            renderItem={({ item: photo }) => (
                                <View style={styles.imageViewerContainer}>
                                    <Image
                                        source={{ uri: photo.url }}
                                        style={styles.imageViewerImage}
                                        resizeMode="contain"
                                        onError={(error) => console.log('Viewer image error:', error)}
                                    />
                                </View>
                            )}
                            keyExtractor={(photo) => photo._id}
                            showsHorizontalScrollIndicator={false}
                        />
                    )}
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
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerActionButton: {
        padding: 8,
        marginLeft: 4,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#1e3a8a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    itemHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    titleContainer: {
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    category: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 24,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#64748b',
    },
    imageSection: {
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    noImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        marginHorizontal: 20,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    noImageText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9ca3af',
    },
    imageGallery: {
        paddingHorizontal: 20,
    },
    galleryImageContainer: {
        position: 'relative',
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    galleryImage: {
        width: 150,
        height: 150,
        borderRadius: 12,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    descriptionSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    description: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    detailsSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailsGrid: {
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: '#1e293b',
    },
    contactSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    contactCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1e3a8a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    contactDetails: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    contactId: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    contactDepartment: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    contactButton: {
        borderRadius: 12,
        overflow: 'hidden',
        // justifyContent: 'center',
        flexDirection: 'row',
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    anonymousContactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    anonymousContactText: {
        flex: 1,
        marginLeft: 12,
    },
    anonymousContactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
    },
    anonymousContactDescription: {
        fontSize: 14,
        color: '#a16207',
        marginTop: 4,
    },
    actionSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 12,
    },
    reportButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
        marginLeft: 8,
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
        maxHeight: '80%',
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
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    modalDescription: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
        marginBottom: 20,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    sendButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    sendGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 8,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f8fafc',
    },
    reasonOptionSelected: {
        backgroundColor: '#dbeafe',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#1e3a8a',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1e3a8a',
    },
    reasonText: {
        fontSize: 16,
        color: '#64748b',
    },
    reasonTextSelected: {
        color: '#1e3a8a',
        fontWeight: '600',
    },
    reportTextArea: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitReportButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitReportGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    submitReportText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 8,
    },
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 8,
    },
    imageViewerContainer: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerImage: {
        width: width - 40,
        height: width - 40,
        maxHeight: '80%',
    },
});

export default ViewLostDetailsScreen;