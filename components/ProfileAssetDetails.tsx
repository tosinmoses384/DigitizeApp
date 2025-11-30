import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontSz } from '../constants';
import { useI18n } from '../hooks/use-i18n';

export interface ProfileAssetDetailsProps {
  asset: {
    id?: string;
    name?: string;
    title?: string;
    description?: string;
    brandName?: string;
    brand?: string;
    itemBrand?: string;
    sizeName?: string;
    size?: string;
    itemSize?: string;
    seasonName?: string;
    season?: string;
    price?: number | string;
    itemPrice?: number | string;
    status?: string;
    itemColours?: Array<{ itemColour?: string; itemColourId?: string } | string>;
    datePosted?: string;
    assetType?: string;
    [key: string]: any;
  };
}

const ProfileAssetDetails: React.FC<ProfileAssetDetailsProps> = ({ asset }) => {
  const { t } = useI18n();

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format colors
  const formatColors = () => {
    if (!asset.itemColours || asset.itemColours.length === 0) return 'N/A';
    
    return asset.itemColours
      .map((color: any) => {
        if (typeof color === 'string') return color;
        return color?.itemColour || color?.itemColourId || '';
      })
      .filter(Boolean)
      .join(', ') || 'N/A';
  };

  // Format price
  const formatPrice = () => {
    const price = asset.price || asset.itemPrice;
    if (!price) return 'N/A';
    if (typeof price === 'number') {
      return `£${price.toFixed(2)}`;
    }
    return price;
  };

  return (
    <View style={styles.detailsContainer}>
      {/* Brand */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('wardrobe.brand')}</Text>
        <Text style={styles.detailValue}>
          {asset.brandName || asset.brand || asset.itemBrand || 'N/A'}
        </Text>
      </View>

      {/* Size */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('wardrobe.size')}</Text>
        <Text style={styles.detailValue}>
          {asset.sizeName || asset.size || asset.itemSize || 'N/A'}
        </Text>
      </View>

      {/* Season */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('wardrobe.season')}</Text>
        <Text style={styles.detailValue}>
          {asset.seasonName || asset.season || 'N/A'}
        </Text>
      </View>

      {/* Title */}
      {asset.title && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.title')}</Text>
          <Text style={styles.detailValue}>{asset.title}</Text>
        </View>
      )}

      {/* Description */}
      {asset.description && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.description')}</Text>
          <Text style={styles.detailValue}>{asset.description}</Text>
        </View>
      )}

      {/* Price */}
      {(asset.price || asset.itemPrice) && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.price')}</Text>
          <Text style={styles.detailValue}>{formatPrice()}</Text>
        </View>
      )}

      {/* Status */}
      {asset.status && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.status')}</Text>
          <Text style={styles.detailValue}>
            {asset.status}
          </Text>
        </View>
      )}

      {/* Color */}
      {asset.itemColours && asset.itemColours.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.color')}</Text>
          <Text style={styles.detailValue}>
            {asset.itemColours
              .map((color: any) => color?.itemColour || color)
              .join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: fontSz(12),
    fontFamily: 'DMSansMedium',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: fontSz(12),
    fontFamily: 'DMSansRegular',
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
});

export default ProfileAssetDetails;

