<div class="membergrid">
  <?php 
 
  //Define your custom post type name in the arguments
  $args = array('post_type' => 'gcompany');
   
  //Define the loop based on arguments
  $loop = new WP_Query( $args );
   
  //Display the contents 
  while ( $loop->have_posts() ) : $loop->the_post();
  ?>

  <div class="member"><img src="#"/><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>"><?php the_title(); ?></a></div>
  <?php endwhile;?>
</div>
