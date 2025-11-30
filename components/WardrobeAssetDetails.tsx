import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontSz } from '../constants';
import { useI18n } from '../hooks/use-i18n';

export interface WardrobeAssetDetailsProps {
  asset: {
    id?: string;
    name?: string;
    title?: string;
    description?: string;
    brandName?: string;
    brand?: string;
    sizeName?: string;
    size?: string;
    seasonName?: string;
    season?: string;
    price?: number | string;
    status?: string;
    itemColours?: Array<{ itemColour?: string; itemColourId?: string } | string>;
    datePosted?: string;
    assetType?: string;
    [key: string]: any;
  };
}

const WardrobeAssetDetails: React.FC<WardrobeAssetDetailsProps> = ({ asset }) => {
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
    if (!asset.price) return 'N/A';
    if (typeof asset.price === 'number') {
      return `£${asset.price.toFixed(2)}`;
    }
    return asset.price;
  };

  return (
    <View style={styles.detailsContainer}>
      {/* Name/Title */}
      {(asset.name || asset.title) && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.name') || 'Name'}</Text>
          <Text style={styles.detailValue}>{asset.name || asset.title}</Text>
        </View>
      )}

      {/* Brand */}
      {(asset.brandName || asset.brand) && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.brand') || 'Brand'}</Text>
          <Text style={styles.detailValue}>
            {asset.brandName || asset.brand || 'N/A'}
          </Text>
        </View>
      )}

      {/* Size */}
      {(asset.sizeName || asset.size) && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.size') || 'Size'}</Text>
          <Text style={styles.detailValue}>
            {asset.sizeName || asset.size || 'N/A'}
          </Text>
        </View>
      )}

      {/* Season */}
      {(asset.seasonName || asset.season) && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.season') || 'Season'}</Text>
          <Text style={styles.detailValue}>
            {asset.seasonName || asset.season || 'N/A'}
          </Text>
        </View>
      )}

      {/* Description */}
      {asset.description && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {t('wardrobe.description') || 'Description'}
          </Text>
          <Text style={styles.detailValue}>{asset.description}</Text>
        </View>
      )}

      {/* Price */}
      {asset.price && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.price') || 'Price'}</Text>
          <Text style={styles.detailValue}>{formatPrice()}</Text>
        </View>
      )}

      {/* Status */}
      {asset.status && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.status') || 'Status'}</Text>
          <Text style={styles.detailValue}>{asset.status}</Text>
        </View>
      )}

      {/* Color */}
      {asset.itemColours && asset.itemColours.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('wardrobe.color') || 'Color'}</Text>
          <Text style={styles.detailValue}>{formatColors()}</Text>
        </View>
      )}

      {/* Date Posted */}
      {asset.datePosted && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {t('wardrobe.datePosted') || 'Date Posted'}
          </Text>
          <Text style={styles.detailValue}>{formatDate(asset.datePosted)}</Text>
        </View>
      )}

      {/* Asset Type */}
      {asset.assetType && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {t('wardrobe.type') || 'Type'}
          </Text>
          <Text style={styles.detailValue}>
            {asset.assetType === 'WardrobeItem' 
              ? t('wardrobe.item') || 'Item'
              : asset.assetType === 'WardrobeOutfit'
              ? t('wardrobe.outfit') || 'Outfit'
              : asset.assetType}
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

export default WardrobeAssetDetails;

