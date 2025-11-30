import React, { memo } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Frame from '../assets/images/0_wdrobeSVG/Frame.svg';
import Frame3 from '../assets/images/0_wdrobeSVG/Frame3.svg';
import Frame2 from '../assets/images/0_wdrobeSVG/Frame2.svg';
import Frame5 from '../assets/images/0_wdrobeSVG/Frame4.svg';
import Frame4 from '../assets/images/0_wdrobeSVG/Frame4.svg';
import { useI18n } from '../hooks/use-i18n';

interface TaggingFilterProps {
  onFilterPress?: () => void;
  totalItems?: number;
  selectedFilter?: string;
  onFilterSelect?: (filter: string) => void;
}

const TaggingFilter = memo(({ onFilterPress, totalItems = 0, selectedFilter, onFilterSelect }: TaggingFilterProps) => {
  const { t } = useI18n();
  const defaultFilter = t('wardrobe.allItems');
  const activeFilter = selectedFilter || defaultFilter;
  
  return (
    <View style={styles.taggingFilter}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgeParent}
        style={styles.badgeScrollView}
      >
        <Pressable 
          style={styles.badge}
          onPress={() => onFilterSelect?.(t('wardrobe.allItems'))}
        >
          <View style={[
            styles.badgeBase,
            activeFilter !== t('wardrobe.allItems') && styles.badgeBaseUnselected
          ]}>
            <Frame 
              style={styles.frameIcon}
              color={activeFilter === t('wardrobe.allItems') ? '#fff7f8' : '#b5b9be'}
              width={17} 
              height={16} 
            />
            <Text style={[
              styles.text,
              activeFilter !== t('wardrobe.allItems') && styles.textUnselected
            ]}>{t('wardrobe.allItems')}</Text>
          </View>
        </Pressable>
        <Pressable 
          style={styles.taggingFilterBadge}
          onPress={() => onFilterSelect?.(t('wardrobe.tops'))}
        >
          <View style={[
            styles.taggingFilterBadgeBase,
            activeFilter === t('wardrobe.tops') && styles.badgeBaseSelected
          ]}>
            <Frame3
              style={styles.taggingFilterFrameIcon}
              color={activeFilter === t('wardrobe.tops') ? '#fff7f8' : '#b5b9be'}
              width={16}
              height={16}
            />
            <Text style={[
              styles.taggingFilterText,
              activeFilter === t('wardrobe.tops') && styles.textSelected
            ]}>{t('wardrobe.tops')}</Text>
          </View>
        </Pressable>
        <Pressable 
          style={styles.badge2}
          onPress={() => onFilterSelect?.(t('wardrobe.bottoms'))}
        >
          <View style={[
            styles.badgeBase2,
            activeFilter === t('wardrobe.bottoms') && styles.badgeBaseSelected
          ]}>
            <Frame2 
              style={styles.frameIcon2}
              color={activeFilter === t('wardrobe.bottoms') ? '#fff7f8' : '#b5b9be'}
              width={16} 
              height={16} 
            />
            <Text style={[
              styles.text2,
              activeFilter === t('wardrobe.bottoms') && styles.textSelected
            ]}>{t('wardrobe.bottoms')}</Text>
          </View>
        </Pressable>
        <Pressable 
          style={styles.badge3}
          onPress={() => onFilterSelect?.(t('wardrobe.footwear'))}
        >
          <View style={[
            styles.badgeBase3,
            activeFilter === t('wardrobe.footwear') && styles.badgeBaseSelected
          ]}>
            <Frame5 
              style={styles.frameIcon3}
              color={activeFilter === t('wardrobe.footwear') ? '#fff7f8' : '#b5b9be'}
              width={18} 
              height={16} 
            />
            <Text style={[
              styles.text3,
              activeFilter === t('wardrobe.footwear') && styles.textSelected
            ]}>{t('wardrobe.footwear')}</Text>
          </View>
        </Pressable>
      </ScrollView>
      <View style={styles.advanceFilter}>
        <View style={styles.parent}>
          <Text style={styles.text4}>{`${totalItems} `}</Text>
          <Text style={styles.items}>{t('wardrobe.items')}</Text>
        </View>
        <Pressable style={styles.filter} onPress={onFilterPress}>
          <View style={styles.badgeBase4}>
            <Frame4 style={styles.frameIcon4} width={20} height={20} />
            <Text style={styles.text5}>{t('wardrobe.filter')}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
});

TaggingFilter.displayName = 'TaggingFilter';

const styles = StyleSheet.create({
  taggingFilter: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 8,
  },
  badgeScrollView: {
    flexGrow: 0,
  },
  badgeParent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeBase: {
    borderRadius: 16,
    backgroundColor: '#ff5c68',
    borderStyle: 'solid',
    borderColor: '#ff3b4a',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 2,
  },
  frameIcon: {
    width: 17,
    height: 16,
    color: '#fff7f8',
  },
  text: {
    height: 20,
    width: 44,
    fontSize: 10,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  taggingFilterBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taggingFilterBadgeBase: {
    borderRadius: 16,
    backgroundColor: '#edf2f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 2,
  },
  taggingFilterFrameIcon: {
    width: 16,
    height: 16,
    color: '#b5b9be',
  },
  taggingFilterText: {
    height: 20,
    width: 26,
    fontSize: 10,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#1e3448',
    textAlign: 'left',
  },
  badge2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeBase2: {
    borderRadius: 16,
    backgroundColor: '#edf2f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 2,
  },
  frameIcon2: {
    width: 16,
    height: 16,
    color: '#b5b9be',
  },
  text2: {
    height: 20,
    width: 44,
    fontSize: 10,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#1e3448',
    textAlign: 'center',
  },
  badge3: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeBase3: {
    borderRadius: 16,
    backgroundColor: '#edf2f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 2,
  },
  frameIcon3: {
    width: 18,
    height: 16,
    color: '#b5b9be',
  },
  text3: {
    height: 20,
    width: 48,
    fontSize: 10,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#1e3448',
    textAlign: 'center',
  },
  advanceFilter: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 0,
    paddingHorizontal: 16,
  },
  parent: {
    width: 230,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  text4: {
    height: 21,
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 21,
    textTransform: 'uppercase',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#000',
    textAlign: 'left',
  },
  items: {
    height: 18,
    width: 36,
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#000',
    textAlign: 'left',
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeBase4: {
    borderRadius: 16,
    backgroundColor: '#e9eaeb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  frameIcon4: {
    width: 20,
    height: 20,
    color: '#464f5d',
  },
  text5: {
    height: 20,
    width: 28,
    fontSize: 10,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#464f5d',
    textAlign: 'center',
  },
  // Selected state styles (red background with white text)
  badgeBaseSelected: {
    backgroundColor: '#ff5c68',
    borderColor: '#ff3b4a',
    borderWidth: 1,
  },
  textSelected: {
    color: '#fff',
  },
  // Unselected state styles (gray background with dark text)
  badgeBaseUnselected: {
    backgroundColor: '#edf2f7',
    borderWidth: 0,
  },
  textUnselected: {
    color: '#1e3448',
  },
});

export default TaggingFilter;
