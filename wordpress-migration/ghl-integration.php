<?php
/**
 * GoHighLevel (GHL) Integration for Disaster911
 * Handles tracking script injection and form embedding helpers.
 *
 * Include in child theme's functions.php:
 * require_once get_stylesheet_directory() . '/ghl-integration.php';
 */

// 1. Inject GHL External Tracking Script into Header
function disaster911_ghl_tracking_script() {
    ?>
    <!-- GoHighLevel Tracking Code -->
    <script src="https://link.msgsndr.com/js/traffic-source.js"></script>
    <script>
        // Placeholder for GHL Tracking ID if needed
        // window.ghl_id = 'YOUR_TRACKING_ID'; 
    </script>
    <?php
}
add_action('wp_head', 'disaster911_ghl_tracking_script');

/**
 * Helper to render GHL Form
 * Usage in PHP: echo disaster911_get_ghl_form('YOUR_FORM_ID');
 */
function disaster911_get_ghl_form($form_id) {
    if (!$form_id) return '';
    
    return '
    <div class="ghl-form-container">
        <iframe 
            src="https://link.msgsndr.com/widget/form/' . esc_attr($form_id) . '" 
            style="width:100%;height:100%;border:none;border-radius:8px;" 
            id="inline-' . esc_attr($form_id) . '" 
            data-layout="{'id':'INLINE'}" 
            data-trigger-type="alwaysShow" 
            data-trigger-value="" 
            data-activation-type="alwaysActivated" 
            data-activation-value="" 
            data-deactivation-type="neverDeactivate" 
            data-deactivation-value="" 
            data-form-name="Website Contact Form" 
            data-scoped-slots="true" 
            data-token="YOUR_TOKEN"
            class="ghl-iframe-form"
        ></iframe>
        <script src="https://link.msgsndr.com/js/form_embed.js"></script>
    </div>';
}

/**
 * Inject Chat Widget (Optional)
 */
function disaster911_ghl_chat_widget() {
    // Only load if not on specialized landing pages if desired
    ?>
    <!-- GHL Chat Widget -->
    <script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="YOUR_WIDGET_ID"> </script>
    <?php
}
// add_action('wp_footer', 'disaster911_ghl_chat_widget');
