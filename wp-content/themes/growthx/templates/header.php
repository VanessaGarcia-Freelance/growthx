<header>
  <nav class="navbar navmenu">
    <div class="container">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-menu" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="<?= esc_url(home_url('/')); ?>">

        <?php
          //echo file_get_contents( get_template_directory() . "/assets/images/growthx-logo.svg"); ?>

        <?php get_template_part('templates/svg', 'logo'); ?>

        <!-- <img src = "<?php $upload_dir = wp_upload_dir(); //echo $upload_dir['baseurl']; ?>/2015/11/growthx-logo.svg" alt="<?php bloginfo('name'); ?>" /> -->
       </a>
      </div>

      <!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse" id="main-menu">
         <?php
        if (has_nav_menu('primary_navigation')) :
          wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav navbar-nav navbar-right']);
        endif;
        ?>
      </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
  </nav>
</header>
