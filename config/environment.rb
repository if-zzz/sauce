RAILS_GEM_VERSION = '2.1.1' unless defined? RAILS_GEM_VERSION

require File.join(File.dirname(__FILE__), 'boot')

Rails::Initializer.run do |config|
  config.time_zone = 'UTC'
  config.action_controller.session = {
    :session_key => '_sauce_session',
    :secret      => 'cabc25979ee9dfa398304822249e0d4b9a2ea6069663eb7f1971e466c8c06b815cb7eda6aace8b2afcc88e6e131d867469704b20f47455fd72b42347650a7c03'
  }
end

EXIF_TOOL_LOCATION = RAILS_ENV == 'production' ? '~/Image-ExifTool-7.54/exiftool' : 'exiftool'

require 'lib/mini_exiftool'
require 'ftools'

PHOTOS_ROOT = RAILS_ROOT + '/public/photos'
PHOTOS_URI = '/photos'

LENS_TRANSLATIONS = {
  '50.0 mm' => 'Sigma 50mm f/2.8 EX DG Macro',
  '24.0-70.0 mm' => 'Sigma 24-70mm f/2.8 EX Aspherical DG DF',
  '15.0-30.0 mm' => 'Sigma 15-30/3.5-4.5 EX DG DF'
}