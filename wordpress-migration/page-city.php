<?php
/**
 * Template Name: City Page (GHL Ready)
 *
 * Pulls dynamic fields from ACF and embeds GHL forms for lead capture.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

get_header(); ?>

<div id="primary" class="content-area grid-parent mobile-grid-100 grid-100 tablet-grid-100">
	<main id="main" class="site-main">

        <?php
        while ( have_posts() ) :
            the_post();

            // 1. Get ACF Data
            $city_name    = get_field('acf_city_name');
            $service_label= get_field('acf_service_label');
            $distance_min = get_field('acf_distance_minutes');
            $local_hook   = get_field('acf_local_hook');
            $local_risk   = get_field('acf_local_risk');
            
            // Format phone number
            $phone = '(616) 822-1978';
            $phone_link = 'tel:6168221978';

            // Generate Schema
            $schema = [
                "@context" => "https://schema.org",
                "@type" => "LocalBusiness",
                "name" => "Disaster Response by Ryan - " . $city_name,
                "telephone" => $phone,
                "areaServed" => [
                    "@type" => "City",
                    "name" => $city_name,
                    "address" => ["@type"=>"PostalAddress", "addressRegion"=>"MI"]
                ]
            ];
            ?>
            <script type="application/ld+json"><?php echo json_encode($schema); ?></script>

            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                
                <!-- Hero Section -->
                <div class="entry-header city-hero" style="background:var(--primary); color:white; padding:4rem 2rem; text-align:center;">
                    <h1 class="entry-title" itemprop="headline">
                        <?php echo $service_label; ?> in <?php echo $city_name; ?>, MI
                    </h1>
                    <p class="hero-sub" style="font-size:1.2rem; margin-top:1rem;">
                        Ryan Answers Personally. On-site in <?php echo $distance_min; ?> minutes.
                    </p>
                    <a href="<?php echo $phone_link; ?>" class="button hero-btn" style="background:var(--accent); color:white; font-weight:800; padding:1rem 2rem; border-radius:8px; margin-top:1.5rem; display:inline-block;">
                        Call <?php echo $phone; ?> — 24/7 Emergency
                    </a>
                </div>

                <div class="entry-content" itemprop="text" style="max-width:800px; margin:3rem auto; padding:0 1rem;">
                    
                    <!-- Local Hook / Intro -->
                    <h2>Emergency <?php echo $service_label; ?> in <?php echo $city_name; ?></h2>
                    <p>
                        Disaster Response by Ryan is a local, family-owned restoration company serving <strong><?php echo $city_name; ?></strong> 
                        and surrounding West Michigan communities. Unlike national franchises with call centers, when you call <?php echo $phone; ?>, 
                        Ryan Penny (owner) answers directly.
                    </p>
                    <p>
                        We are based in Walker, just <strong><?php echo $distance_min; ?> minutes</strong> from <?php echo $city_name; ?>. 
                        Our team understands the specific risks in your area:
                    </p>
                    <blockquote style="border-left:4px solid var(--accent); padding-left:1rem; font-style:italic; background:#f8fafc; padding:1rem;">
                        "<?php echo $local_hook; ?>"
                    </blockquote>

                    <?php if ( stripos($service_label, 'Mold') !== false ) : ?>
                    <!-- NORMI / Well Abode Section for Mold -->
                    <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:1.5rem; margin:2.5rem 0;">
                        <h3 style="color:#14532d; margin-top:0; display:flex; align-items:center; gap:.5rem;"><i class="fa-solid fa-shield-virus"></i> Hypersensitivity Protocols</h3>
                        <p style="color:#166534; font-size:0.95rem;">
                            For our hypersensitive clients in <?php echo $city_name; ?>, we partner with <strong>Lisa</strong> at <a href="https://www.wellabode.com/about" target="_blank" rel="noopener" style="color:#14532d; font-weight:700; text-decoration:underline;">Well Abode</a>. 
                            To ensure an unbiased, health-first outcome, we keep testing strictly third-party. 
                            <strong>Lisa leads the protocol writing</strong> for these cases, which our team executes with surgical precision to ensure your home is truly safe.
                        </p>
                    </div>
                    <?php endif; ?>

                    <!-- GHL Lead Capture Form -->
                    <div class="ghl-form-wrap" style="margin:3rem 0; background:#f1f5f9; padding:2rem; border-radius:12px; border:1px solid #cbd5e1;">
                        <h3 style="text-align:center; margin-bottom:1.5rem;">Request a Free Assessment in <?php echo $city_name; ?></h3>
                        <?php 
                        if (function_exists('disaster911_get_ghl_form')) {
                            echo disaster911_get_ghl_form('YOUR_GHL_FORM_ID');
                        } else {
                            echo '<p style="text-align:center; color:var(--text-muted);">[GoHighLevel Form Placeholder]</p>';
                        }
                        ?>
                    </div>

                    <!-- Service Details -->
                    <h3>Why Choose Us for <?php echo $city_name; ?> Restoration?</h3>
                    <ul>
                        <li><strong>Fast Response:</strong> On-site in <?php echo $city_name; ?> in under <?php echo $distance_min; ?> minutes.</li>
                        <li><strong>Local Knowledge:</strong> We know <?php echo $city_name; ?> zoning, housing stock, and typical <?php echo $local_risk; ?> issues.</li>
                        <li><strong>Insurance Assistance:</strong> We work with all major carriers. While mold coverage varies by policy, we provide the expert documentation adjusters require.</li>
                    </ul>

                    <!-- Call to Action -->
                    <div class="cta-box" style="background:var(--primary); color:white; padding:2rem; border-radius:8px; text-align:center; margin:2rem 0;">
                        <h3><?php echo $service_label; ?> in <?php echo $city_name; ?>?</h3>
                        <p>Don't wait. We are available 24/7.</p>
                        <a href="<?php echo $phone_link; ?>" class="button" style="background:var(--accent); color:white; font-weight:bold; padding:0.8rem 1.5rem; border-radius:4px;">
                            Call Ryan Now: <?php echo $phone; ?>
                        </a>
                    </div>

                </div><!-- .entry-content -->

            </article><!-- #post-## -->

        <?php
        endwhile; // End of the loop.
        ?>

	</main><!-- #main -->
</div><!-- #primary -->

<?php
get_footer();
