<?php
/**
 * Custom Post Type Registration for City Pages
 * & URL Rewrite Rules for Disaster911
 *
 * Include this file in your child theme's functions.php
 * require_once get_stylesheet_directory() . '/functions-cpt.php';
 */

function disaster911_register_cpt() {
    $labels = array(
        'name'                  => _x( 'City Pages', 'Post Type General Name', 'text_domain' ),
        'singular_name'         => _x( 'City Page', 'Post Type Singular Name', 'text_domain' ),
        'menu_name'             => __( 'City Pages', 'text_domain' ),
        'all_items'             => __( 'All City Pages', 'text_domain' ),
        'add_new_item'          => __( 'Add New City Page', 'text_domain' ),
        'add_new'               => __( 'Add New', 'text_domain' ),
        'new_item'              => __( 'New City Page', 'text_domain' ),
        'edit_item'             => __( 'Edit City Page', 'text_domain' ),
        'update_item'           => __( 'Update City Page', 'text_domain' ),
        'view_item'             => __( 'View City Page', 'text_domain' ),
        'search_items'          => __( 'Search City Pages', 'text_domain' ),
    );
    $args = array(
        'label'                 => __( 'City Page', 'text_domain' ),
        'description'           => __( 'Landing pages for specific cities and services', 'text_domain' ),
        'labels'                => $labels,
        'supports'              => array( 'title', 'editor', 'custom-fields', 'revisions' ),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-location',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'page',
        // IMPORTANT: We handle rewriting manually below
        'rewrite'               => false, 
    );
    register_post_type( 'city_page', $args );
}
add_action( 'init', 'disaster911_register_cpt', 0 );

/**
 * Custom Rewrite Rules
 * Maps /service-slug/city-slug/ to the correct city_page CPT
 */
function disaster911_rewrite_rules() {
    // Array of your service slugs
    $services = [
        'water-damage-restoration',
        'fire-damage-restoration',
        'mold-remediation',
        'sewage-cleanup'
    ];

    foreach ($services as $service) {
        // Rule: /water-damage-restoration/grand-rapids-mi/ -> city_page
        // We need to look up the post by its unique name or meta. 
        // Simplest: use the unique slug we generated in import: "water-damage-restoration-grand-rapids-mi"
        
        // Matches: water-damage-restoration/([^/]+)/?
        // Maps to: index.php?post_type=city_page&name=water-damage-restoration-$matches[1]
        
        add_rewrite_rule(
            '^' . $service . '/([^/]+)/?$',
            'index.php?post_type=city_page&name=' . $service . '-$matches[1]',
            'top'
        );
    }
}
add_action('init', 'disaster911_rewrite_rules');

/**
 * Flush rewrite rules on theme activation
 * (Do not leave this in production permanently, runs on every page load if not careful)
 */
function disaster911_flush_rewrites() {
    disaster911_rewrite_rules();
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'disaster911_flush_rewrites' );
