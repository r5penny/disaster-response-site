<?php
/**
 * Disaster Response by Ryan - Child Theme Functions
 */

// 1. Include CPT and Rewrite Logic
require_once get_stylesheet_directory() . '/wordpress-migration/functions-cpt.php';

// 2. Include GHL Integration
require_once get_stylesheet_directory() . '/wordpress-migration/ghl-integration.php';

// 3. Include City Content Variants
require_once get_stylesheet_directory() . '/wordpress-migration/city-content-functions.php';

// 4. Enqueue Parent Styles and Child Assets
function disaster911_child_assets() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    
    // Font Awesome 6
    wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', [], '6.4.0' );
    
    // Child JS (Dark mode + Mobile toggle)
    wp_enqueue_script( 'disaster911-main', get_stylesheet_directory_uri() . '/js/main.js', [], '2.0', true );
}
add_action( 'wp_enqueue_scripts', 'disaster911_child_assets' );

// 5. Dynamic Breadcrumbs and Schema Overrides (Rank Math)
add_filter('rank_math/title', function($title) {
    if (is_singular('city_page')) {
        $city = get_field('acf_city_name');
        $svc  = get_field('acf_service_label');
        return "{$city} {$svc} | 24/7 Response | (616) 822-1978";
    }
    return $title;
});

// 6. Register Sidebar for City Pages
function disaster911_register_sidebars() {
    register_sidebar( array(
        'name'          => 'City Page Sidebar',
        'id'            => 'city-page-sidebar',
        'before_widget' => '<div class="widget">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );
}
add_action( 'widgets_init', 'disaster911_register_sidebars' );
