import { useState } from 'react';

const useModal = () => {
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: null,
        message: '',
        type: 'info',
        showButtons: false,
        onOk: null,
        onCancel: null,
        okText: 'OK',
        cancelText: 'Cancel',
        okNavigateTo: null,
    });

    const showModal = (config) => {
        setModalConfig({
            visible: true,
            title: config.title || null,
            message: config.message || '',
            type: config.type || 'info',
            showButtons: config.showButtons || false,
            onOk: config.onOk || null,
            onCancel: config.onCancel || null,
            okText: config.okText || 'OK',
            cancelText: config.cancelText || 'Cancel',
            okNavigateTo: config.okNavigateTo || null,
        });
    };

    const hideModal = () => {
        setModalConfig(prev => ({
            ...prev,
            visible: false,
        }));
    };

    // Quick helper functions
    const showError = (message, title = 'Error') => {
        showModal({
            title,
            message,
            type: 'error',
        });
    };

    const showSuccess = (message, title = 'Success') => {
        showModal({
            title,
            message,
            type: 'success',
        });
    };

    const showWarning = (message, title = 'Warning') => {
        showModal({
            title,
            message,
            type: 'warning',
        });
    };

    const showInfo = (message, title = 'Info') => {
        showModal({
            title,
            message,
            type: 'info',
        });
    };

    const showConfirm = (message, onConfirm, title = 'Confirm') => {
        showModal({
            title,
            message,
            type: 'warning',
            showButtons: true,
            onOk: onConfirm,
            onCancel: () => { },
            okText: 'Yes',
            cancelText: 'No',
        });
    };

    return {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showConfirm,
    };
};

export default useModal;