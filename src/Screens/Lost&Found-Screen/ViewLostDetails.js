import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
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
import { useMatchLostFoundMutation } from '../../Redux/apiSlice'


const { width } = Dimensions.get('window');

const ViewLostDetailsScreen = ({ navigation, route }) => {
    const { itemDetail, Allitems, refetchitems } = route.params || {};
    const [matchLostFound] = useMatchLostFoundMutation();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [matchModalVisible, setMatchModalVisible] = useState(false);
    const [selectedMatchItem, setSelectedMatchItem] = useState(null);
    const [lostItems, setLostItems] = useState([]);

    const { modalConfig, showModal, hideModal, showError, showSuccess } = useModal();

    useEffect(() => {
        fetchItemDetails();
        if (Allitems) {
            const filteredLostItems = Allitems.filter(i => i.type === 'lost');
            setLostItems(filteredLostItems);
        }
    }, [itemDetail, Allitems]);

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
    const handleRefresh = async () => {
        if (refetchitems) {
            try {
                await refetchitems();
                console.log('Data refreshed successfully');
            } catch (err) {
                console.error('Error refetching:', err);
            }
        }
    };

    const handleContactPress = () => {
        if (item.contactInfo) {
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
            await Share.share({ message, title: `${item.type === 'lost' ? 'Lost' : 'Found'} Item: ${item.title}` });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleMatchPress = () => {
        if (lostItems.length === 0) {
            showError('No Items', 'There are no lost items available for matching.');
            return;
        }
        setMatchModalVisible(true);
    };

    const handleMatchSubmit = async () => {
        if (!selectedMatchItem) {
            showError('Error', 'Please select a lost item to match with.');
            return;
        }

        const lostId = selectedMatchItem._id || selectedMatchItem;
        const foundId = item._id;

        console.log('📦 Sending:', { foundItemId: foundId, lostItemId: lostId });

        try {
            const response = await matchLostFound({
                foundItemId: foundId,
                lostItemId: lostId,
            }).unwrap();

            setMatchModalVisible(false);
            setSelectedMatchItem(null);
            showSuccess('Success', response.message || 'Items matched successfully!');
            handleRefresh();
            navigation.goBack();
        } catch (error) {
            console.error('Match Error:', error);
            let errorMessage = 'Failed to match items. Please try again.';
            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.status === 'FETCH_ERROR') {
                errorMessage = 'Network error. Please check your connection.';
            }
            showError('Error', errorMessage);
        }
    };




    const openImageViewer = (index) => {
        setSelectedImageIndex(index);
        setImageViewerVisible(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getTypeIcon = (itemType) => itemType === 'lost' ? 'search' : 'check-circle';
    const getTypeColor = (itemType) => itemType === 'lost' ? '#ef4444' : '#10b981';
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
                {item.photos.map((photo, index) => (
                    <TouchableOpacity key={photo._id} onPress={() => openImageViewer(index)} style={styles.galleryImageContainer}>
                        <Image source={{ uri: photo.url }} style={styles.galleryImage} resizeMode="cover" />
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
                            <Text style={styles.anonymousContactDescription}>The poster chose to remain anonymous.</Text>
                        </View>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.contactCard}>
                    <View style={styles.contactHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{item.reportedBy?.fullName.split(' ').map(n => n[0]).join('')}</Text>
                        </View>
                        <View style={styles.contactDetails}>
                            <Text style={styles.contactName}>{item.reportedBy?.fullName}</Text>
                            <Text style={styles.contactId}>{item.reportedBy?.uniId}</Text>
                        </View>
                    </View>
                    {item.contactInfo && (
                        <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                            <Icon name={item.contactInfo.includes('@') ? 'email' : 'phone'} size={20} color="#000" />
                            <Text style={styles.contactButtonText}>{item.contactInfo.includes('@') ? 'Send Email' : 'Call Now'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderMatchItemCard = ({ item: lostItem }) => {
        const isSelected = selectedMatchItem === lostItem._id;
        return (
            <TouchableOpacity style={[styles.matchItemCard, isSelected && styles.matchItemCardSelected]} onPress={() => setSelectedMatchItem(lostItem._id)}>
                <View style={styles.matchItemImageContainer}>
                    {lostItem.photos && lostItem.photos.length > 0 ? (
                        <Image source={{ uri: lostItem.photos[0].url }} style={styles.matchItemImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.matchItemNoImage}>
                            <Icon name="image" size={32} color="#d1d5db" />
                        </View>
                    )}
                    {isSelected && (
                        <View style={styles.matchItemSelectedBadge}>
                            <Icon name="check-circle" size={24} color="#10b981" />
                        </View>
                    )}
                </View>
                <View style={styles.matchItemInfo}>
                    <Text style={styles.matchItemTitle} numberOfLines={2}>{lostItem.title}</Text>
                    <Text style={styles.matchItemCategory}>{lostItem.category}</Text>
                    <View style={styles.matchItemMeta}>
                        <Icon name="location-on" size={14} color="#64748b" />
                        <Text style={styles.matchItemLocation} numberOfLines={1}>{lostItem.location}</Text>
                    </View>
                    <View style={styles.matchItemMeta}>
                        <Icon name="event" size={14} color="#64748b" />
                        <Text style={styles.matchItemDate}>{new Date(lostItem.dateLostOrFound).toLocaleDateString()}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#1e3a8a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Item Details</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Item Not Found</Text>
                    <Text style={styles.errorSubtitle}>The item you're looking for doesn't exist or has been removed.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
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
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Item Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
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
                                <Text style={styles.detailLabel}>Date {item.type === 'lost' ? 'Lost' : 'Found'}</Text>
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

                {item.type === 'found' && (
                    <View style={styles.matchSection}>
                        <TouchableOpacity style={styles.matchButton} onPress={handleMatchPress}>
                            <LinearGradient colors={['#1e3a8a', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.matchButtonGradient}>
                                <Icon name="link" size={20} color="#ffffff" />
                                <Text style={styles.matchButtonText}>Match with Lost Item</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={matchModalVisible} onRequestClose={() => setMatchModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Lost Item to Match</Text>
                            <TouchableOpacity onPress={() => { setMatchModalVisible(false); setSelectedMatchItem(null); }}>
                                <Icon name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalDescription}>Select a lost item that matches with the found item "{item.title}"</Text>
                            {lostItems.length > 0 ? (
                                <FlatList data={lostItems} renderItem={renderMatchItemCard} keyExtractor={(item) => item._id} scrollEnabled={false} contentContainerStyle={styles.matchItemsList} />
                            ) : (
                                <View style={styles.noItemsContainer}>
                                    <Icon name="search-off" size={48} color="#d1d5db" />
                                    <Text style={styles.noItemsText}>No lost items available</Text>
                                </View>
                            )}
                        </ScrollView>
                        {lostItems.length > 0 && (
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={[styles.matchSubmitButton, !selectedMatchItem && styles.matchSubmitButtonDisabled]} onPress={handleMatchSubmit} disabled={!selectedMatchItem}>
                                    <LinearGradient colors={selectedMatchItem ? ['#1e3a8a', '#3b82f6'] : ['#94a3b8', '#94a3b8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.matchSubmitGradient}>
                                        <Icon name="check" size={20} color="#ffffff" />
                                        <Text style={styles.matchSubmitText}>Confirm Match</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={imageViewerVisible} onRequestClose={() => setImageViewerVisible(false)}>
                <View style={styles.imageViewerOverlay}>
                    <TouchableOpacity style={styles.imageViewerClose} onPress={() => setImageViewerVisible(false)}>
                        <Icon name="close" size={28} color="#ffffff" />
                    </TouchableOpacity>
                    {item.photos && item.photos.length > 0 && (
                        <FlatList data={item.photos} horizontal pagingEnabled initialScrollIndex={selectedImageIndex} getItemLayout={(data, index) => ({ length: width, offset: width * index, index })} renderItem={({ item: photo }) => (
                            <View style={styles.imageViewerContainer}>
                                <Image source={{ uri: photo.url }} style={styles.imageViewerImage} resizeMode="contain" />
                            </View>
                        )} keyExtractor={(photo) => photo._id} showsHorizontalScrollIndicator={false} />
                    )}
                </View>
            </Modal>

            <CustomModal {...modalConfig} onClose={hideModal} navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a8a', flex: 1, textAlign: 'center', marginHorizontal: 16 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    headerActionButton: { padding: 8, marginLeft: 4 },
    headerRight: { width: 40 },
    content: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#64748b' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    errorTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 8 },
    errorSubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
    retryButton: { backgroundColor: '#1e3a8a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    retryButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    itemHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    titleContainer: { marginBottom: 8 },
    itemTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    typeText: { fontSize: 12, fontWeight: '600', color: '#fff', marginLeft: 4 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    statusText: { fontSize: 12, fontWeight: '600', color: '#fff' },
    category: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    statsContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 24 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 12, color: '#64748b' },
    imageSection: { paddingVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 16, paddingHorizontal: 20 },
    noImageContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, marginHorizontal: 20, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
    noImageText: { marginTop: 12, fontSize: 16, color: '#9ca3af' },
    imageGallery: { paddingHorizontal: 20 },
    galleryImageContainer: { position: 'relative', marginRight: 12, borderRadius: 12, overflow: 'hidden' },
    galleryImage: { width: 150, height: 150, borderRadius: 12 },
    imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', opacity: 0 },
    descriptionSection: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    description: { fontSize: 16, color: '#374151', lineHeight: 24 },
    detailsSection: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    detailsGrid: { gap: 16 },
    detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 4 },
    detailValue: { fontSize: 16, color: '#1e293b' },
    contactSection: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    contactCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16 },
    contactHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e3a8a', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 18, fontWeight: '600', color: '#fff' },
    contactDetails: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    contactId: { fontSize: 14, color: '#64748b', marginTop: 2 },
    contactButton: { borderRadius: 12, overflow: 'hidden', flexDirection: 'row' },
    contactButtonText: { fontSize: 16, fontWeight: '600', color: '#000', marginLeft: 8 },
    anonymousContactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 16, borderRadius: 16 },
    anonymousContactText: { flex: 1, marginLeft: 12 },
    anonymousContactTitle: { fontSize: 16, fontWeight: '600', color: '#92400e' },
    anonymousContactDescription: { fontSize: 14, color: '#a16207', marginTop: 4 },
    matchSection: { paddingHorizontal: 20, paddingVertical: 20 },
    matchButton: { borderRadius: 12, overflow: 'hidden' },
    matchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    matchButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    modalBody: { paddingHorizontal: 20, paddingVertical: 20 },
    modalDescription: { fontSize: 16, color: '#64748b', lineHeight: 24, marginBottom: 20 },
    matchItemsList: { gap: 12 },
    matchItemCard: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 2, borderColor: 'transparent' },
    matchItemCardSelected: { borderColor: '#1e3a8a', backgroundColor: '#dbeafe' },
    matchItemImageContainer: { position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
    matchItemImage: { width: '100%', height: '100%' },
    matchItemNoImage: { width: '100%', height: '100%', backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
    matchItemSelectedBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
    matchItemInfo: { flex: 1, justifyContent: 'space-between' },
    matchItemTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    matchItemCategory: { fontSize: 12, color: '#64748b', textTransform: 'capitalize', marginBottom: 4 },
    matchItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    matchItemLocation: { fontSize: 12, color: '#64748b', flex: 1 },
    matchItemDate: { fontSize: 12, color: '#64748b' },
    noItemsContainer: { alignItems: 'center', paddingVertical: 40 },
    noItemsText: { marginTop: 12, fontSize: 16, color: '#9ca3af' },
    modalFooter: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    matchSubmitButton: { borderRadius: 12, overflow: 'hidden' },
    matchSubmitButtonDisabled: { opacity: 0.7 },
    matchSubmitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    matchSubmitText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
    imageViewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    imageViewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 8 },
    imageViewerContainer: { width, justifyContent: 'center', alignItems: 'center' },
    imageViewerImage: { width: width - 40, height: width - 40, maxHeight: '80%' },
});

export default ViewLostDetailsScreen;